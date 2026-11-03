import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { verifySession } from "../../../../lib/auth";

const ROLE_VALID = ["USER", "ADMIN"];
const PILIH_USER = {
  id: true,
  nama: true,
  email: true,
  kota: true,
  avatar: true,
  role: true,
  createdAt: true,
};

async function pastikanAdmin() {
  const session = await verifySession();

  if (!session) {
    return {
      session: null,
      galat: NextResponse.json(
        { message: "Silakan login terlebih dahulu." },
        { status: 401 }
      ),
    };
  }

  const admin = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { role: true },
  });

  if (!admin || admin.role !== "ADMIN") {
    return {
      session: null,
      galat: NextResponse.json(
        { message: "Akses hanya untuk admin." },
        { status: 403 }
      ),
    };
  }

  return { session, galat: null };
}

export async function GET() {
  try {
    const { galat } = await pastikanAdmin();
    if (galat) return galat;

    const users = await prisma.user.findMany({
      select: PILIH_USER,
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Gagal mengambil daftar pengguna:", error);

    return NextResponse.json(
      { message: "Gagal mengambil daftar pengguna." },
      { status: 500 }
    );
  }
}

/* mengubah role pengguna */
export async function PATCH(request: Request) {
  try {
    const { session, galat } = await pastikanAdmin();
    if (galat || !session) return galat;

    const body = (await request.json().catch(() => ({}))) as {
      id?: string;
      role?: string;
    };

    if (!body.id) {
      return NextResponse.json(
        { message: "id pengguna wajib diisi." },
        { status: 400 }
      );
    }

    if (!body.role || !ROLE_VALID.includes(body.role)) {
      return NextResponse.json(
        { message: "Role pengguna tidak dikenali." },
        { status: 400 }
      );
    }

    /* admin tidak boleh menurunkan dirinya sendiri */
    if (body.id === session.userId) {
      return NextResponse.json(
        { message: "Role akun sendiri tidak dapat diubah." },
        { status: 400 }
      );
    }

    const target = await prisma.user.findUnique({
      where: { id: body.id },
      select: { role: true },
    });

    if (!target) {
      return NextResponse.json(
        { message: "Pengguna tidak ditemukan." },
        { status: 404 }
      );
    }

    /* setidaknya ada 1 admin tersisa */
    if (target.role === "ADMIN" && body.role !== "ADMIN") {
      const jumlahAdmin = await prisma.user.count({
        where: { role: "ADMIN" },
      });

      if (jumlahAdmin <= 1) {
        return NextResponse.json(
          { message: "Minimal harus ada satu akun admin." },
          { status: 400 }
        );
      }
    }

    const user = await prisma.user.update({
      where: { id: body.id },
      data: { role: body.role },
      select: PILIH_USER,
    });

    return NextResponse.json({
      message: "Role pengguna berhasil diperbarui.",
      user,
    });
  } catch (error) {
    console.error("Gagal memperbarui role pengguna:", error);

    return NextResponse.json(
      { message: "Gagal memperbarui role pengguna." },
      { status: 500 }
    );
  }
}
