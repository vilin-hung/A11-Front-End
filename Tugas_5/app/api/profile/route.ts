import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";

/* Data user yang dikirim ke halaman profil (tanpa passwordHash) */
const PILIH_USER = {
  id: true,
  nama: true,
  email: true,
  kota: true,
  avatar: true,
  role: true,
};

/* profil pengguna yang sedang login beserta histori kulinerdan jumlah favoritnya. */
export async function GET() {
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
      select: PILIH_USER,
    });

    if (!user) {
      return NextResponse.json(
        { message: "Pengguna tidak ditemukan." },
        { status: 404 }
      );
    }

    const kuliner = await prisma.kuliner.findMany({
      where: { submittedBy: session.userId },
      orderBy: { createdAt: "desc" },
    });

    const jumlahFavorit = await prisma.favorite.count({
      where: { userId: session.userId },
    });

    return NextResponse.json({ user, kuliner, jumlahFavorit });
  } catch (error) {
    console.error("Gagal mengambil data profil:", error);

    return NextResponse.json(
      { message: "Gagal mengambil data profil." },
      { status: 500 }
    );
  }
}

/* memperbarui nama, kota, atau foto profil. */
export async function PATCH(request: Request) {
  try {
    const session = await verifySession();

    if (!session) {
      return NextResponse.json(
        { message: "Silakan login terlebih dahulu." },
        { status: 401 }
      );
    }

    const body = (await request.json().catch(() => ({}))) as {
      nama?: string;
      kota?: string;
      avatar?: string;
    };

    const perubahan: { nama?: string; kota?: string; avatar?: string } = {};

    if (typeof body.nama === "string") {
      const nama = body.nama.trim();

      if (nama.length < 4) {
        return NextResponse.json(
          { message: "Nama lengkap minimal 4 karakter." },
          { status: 400 }
        );
      }

      perubahan.nama = nama;
    }

    if (typeof body.kota === "string") {
      const kota = body.kota.trim();

      if (!kota) {
        return NextResponse.json(
          { message: "Asal kota/kabupaten wajib diisi." },
          { status: 400 }
        );
      }

      perubahan.kota = kota;
    }

    if (typeof body.avatar === "string") {
      if (!body.avatar.startsWith("data:image/")) {
        return NextResponse.json(
          { message: "Format foto tidak dikenali." },
          { status: 400 }
        );
      }

      perubahan.avatar = body.avatar;
    }

    if (Object.keys(perubahan).length === 0) {
      return NextResponse.json(
        { message: "Tidak ada perubahan yang dikirim." },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { id: session.userId },
      data: perubahan,
      select: PILIH_USER,
    });

    return NextResponse.json({
      message: "Profil berhasil diperbarui.",
      user,
    });
  } catch (error) {
    console.error("Gagal memperbarui profil:", error);

    return NextResponse.json(
      { message: "Gagal memperbarui profil." },
      { status: 500 }
    );
  }
}
