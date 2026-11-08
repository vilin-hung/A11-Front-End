import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";

const STATUS_VALID = ["AKTIF", "NONAKTIF"];

/* Hanya admin yang boleh memakai endpoint ini */
async function pastikanAdmin() {
  const session = await verifySession();

  if (!session) {
    return {
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
      galat: NextResponse.json(
        { message: "Akses hanya untuk admin." },
        { status: 403 }
      ),
    };
  }

  return { galat: null };
}

/* GET: seluruh ulasan beserta data penggunanya. */
export async function GET() {
  try {
    const { galat } = await pastikanAdmin();
    if (galat) return galat;

    const ulasan = await prisma.review.findMany({
      include: {
        user: {
          select: {
            nama: true,
          },
        },
      },
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

/* PATCH: mengaktifkan atau menyembunyikan ulasan. */
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
        { message: "ID ulasan wajib diisi." },
        { status: 400 }
      );
    }

    if (!body.status || !STATUS_VALID.includes(body.status)) {
      return NextResponse.json(
        { message: "Status ulasan tidak dikenali." },
        { status: 400 }
      );
    }

    const ulasanAda = await prisma.review.findUnique({
      where: { id: body.id },
      select: { id: true },
    });

    if (!ulasanAda) {
      return NextResponse.json(
        { message: "Ulasan tidak ditemukan." },
        { status: 404 }
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

/* DELETE: menghapus ulasan secara permanen. */
export async function DELETE(request: Request) {
  try {
    const { galat } = await pastikanAdmin();
    if (galat) return galat;

    const body = (await request.json().catch(() => ({}))) as {
      id?: string;
    };

    if (!body.id) {
      return NextResponse.json(
        { message: "ID ulasan wajib diisi." },
        { status: 400 }
      );
    }

    const ulasanAda = await prisma.review.findUnique({
      where: { id: body.id },
      select: { id: true },
    });

    if (!ulasanAda) {
      return NextResponse.json(
        { message: "Ulasan tidak ditemukan." },
        { status: 404 }
      );
    }

    await prisma.review.delete({
      where: { id: body.id },
    });

    return NextResponse.json({
      message: "Ulasan berhasil dihapus.",
    });
  } catch (error) {
    console.error("Gagal menghapus ulasan:", error);

    return NextResponse.json(
      { message: "Gagal menghapus ulasan." },
      { status: 500 }
    );
  }
}