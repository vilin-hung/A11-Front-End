import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";

const STATUS_VALID = ["TAMPIL", "SEMBUNYI"];

/* Hanya admin yang boleh memakai endpoint ini */
async function pastikanAdmin() {
  const session = await verifySession();

  if (!session) {
    return { galat: NextResponse.json(
      { message: "Silakan login terlebih dahulu." },
      { status: 401 }
    ) };
  }

  const admin = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { role: true },
  });

  if (!admin || admin.role !== "ADMIN") {
    return { galat: NextResponse.json(
      { message: "Akses hanya untuk admin." },
      { status: 403 }
    ) };
  }

  return { galat: null };
}

/* GET: seluruh ulasan beserta nama kulinernya. */
export async function GET() {
  try {
    const { galat } = await pastikanAdmin();
    if (galat) return galat;

    const ulasan = await prisma.review.findMany({
      include: { kuliner: { select: { nama: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ ulasan });
  } catch (error) {
    console.error("Gagal mengambil daftar ulasan:", error);

    return NextResponse.json(
      { message: "Gagal mengambil daftar ulasan." },
      { status: 500 }
    );
  }
}

/* PATCH: menyembunyikan atau menampilkan ulasan. */
export async function PATCH(request: Request) {
  try {
    const { galat } = await pastikanAdmin();
    if (galat) return galat;

    const body = (await request.json().catch(() => ({}))) as {
      id?: string;
      status?: string;
    };

    if (!body.id) {
      return NextResponse.json(
        { message: "id ulasan wajib diisi." },
        { status: 400 }
      );
    }

    if (!body.status || !STATUS_VALID.includes(body.status)) {
      return NextResponse.json(
        { message: "Status ulasan tidak dikenali." },
        { status: 400 }
      );
    }

    const ulasan = await prisma.review.update({
      where: { id: body.id },
      data: { status: body.status },
    });

    return NextResponse.json({
      message: "Status ulasan berhasil diperbarui.",
      ulasan,
    });
  } catch (error) {
    console.error("Gagal memperbarui ulasan:", error);

    return NextResponse.json(
      { message: "Gagal memperbarui ulasan." },
      { status: 500 }
    );
  }
}
