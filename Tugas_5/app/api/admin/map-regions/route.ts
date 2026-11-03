import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { verifySession } from "../../../../lib/auth";

export async function GET() {
  try {
    // Pastikan hanya admin yang dapat mengambil seluruh data daerah.
    const session = await verifySession();

    if (!session) {
      return NextResponse.json(
        { message: "Silakan login terlebih dahulu." },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { role: true },
    });

    if (user?.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Akses hanya untuk admin." },
        { status: 403 }
      );
    }

    // Ambil semua daerah, termasuk yang belum memiliki kuliner approved.
    const [regions, jumlahKuliner] = await Promise.all([
      prisma.mapRegion.findMany({
        orderBy: { nama: "asc" },
      }),

      prisma.kuliner.groupBy({
        by: ["daerah"],
        where: { status: "APPROVED" },
        _count: { _all: true },
      }),
    ]);

    // Buat pencocokan daerah tanpa membedakan huruf besar/kecil.
    const jumlahPerDaerah = new Map(
      jumlahKuliner.map((item) => [
        item.daerah.trim().toLowerCase(),
        item._count._all,
      ])
    );

    const regionsDenganJumlah = regions.map((region) => ({
      ...region,
      jumlahKulinerApproved:
        jumlahPerDaerah.get(region.daerah.trim().toLowerCase()) ?? 0,
    }));

    return NextResponse.json({ regions: regionsDenganJumlah });
  } catch (error) {
    console.error("Gagal mengambil daerah admin:", error);

    return NextResponse.json(
      { message: "Gagal mengambil data daerah." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await verifySession();

    if (!session) {
      return NextResponse.json(
        { message: "Silakan login terlebih dahulu." },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { role: true },
    });

    if (user?.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Akses hanya untuk admin." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { message: "ID daerah tidak ditemukan." },
        { status: 400 }
      );
    }

    const region = await prisma.mapRegion.findUnique({
      where: { id },
    });

    if (!region) {
      return NextResponse.json(
        { message: "Daerah tidak ditemukan." },
        { status: 404 }
      );
    }

    const jumlahKuliner = await prisma.kuliner.count({
      where: {
        daerah: {
          equals: region.daerah,
          mode: "insensitive",
        },
      },
    });

    if (jumlahKuliner > 0) {
      return NextResponse.json(
        {
          message: `Daerah tidak bisa dihapus karena masih digunakan oleh ${jumlahKuliner} data kuliner.`,
        },
        { status: 409 }
      );
    }

    await prisma.mapRegion.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Daerah berhasil dihapus.",
    });
  } catch (error) {
    console.error("Gagal menghapus daerah:", error);

    return NextResponse.json(
      { message: "Gagal menghapus daerah." },
      { status: 500 }
    );
  }
}