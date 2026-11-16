import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { verifySession } from "../../../lib/auth";

// Mengambil seluruh ulasan yang berstatus AKTIF untuk ditampilkan di Home
export async function GET() {
  try {
    const reviews = await prisma.review.findMany({
      where: {
        status: "AKTIF",
      },
      include: {
        user: {
          select: {
            id: true,
            nama: true,
            kota: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ reviews });
  } catch (error) {
    console.error("Gagal mengambil ulasan:", error);

    return NextResponse.json(
      { message: "Gagal mengambil data ulasan." },
      { status: 500 }
    );
  }
}

// Menyimpan ulasan baru dari pengguna yang sudah login
export async function POST(request: Request) {
  try {
    // Memeriksa session pengguna yang sedang login
    const session = await verifySession();

    if (!session) {
      return NextResponse.json(
        { message: "Silakan login terlebih dahulu untuk menulis ulasan." },
        { status: 401 }
      );
    }

    // Mengambil data rating dan komentar dari form
    const body = await request.json();

    const rating = body.rating;
    const komentar =
      typeof body.komentar === "string" ? body.komentar.trim() : "";

    // Memastikan rating berada pada rentang 1 sampai 5
    if (
      typeof rating !== "number" ||
      !Number.isInteger(rating) ||
      rating < 1 ||
      rating > 5
    ) {
      return NextResponse.json(
        { message: "Rating harus berada pada rentang 1 sampai 5 bintang." },
        { status: 400 }
      );
    }

    // Memastikan komentar tidak kosong dan tidak melebihi 1000 karakter
    if (!komentar || komentar.length > 1000) {
      return NextResponse.json(
        { message: "Komentar wajib diisi dan maksimal 1000 karakter." },
        { status: 400 }
      );
    }

    // Memastikan akun pengguna masih tersedia di database
    const user = await prisma.user.findUnique({
      where: {
        id: session.userId,
      },
      select: {
        id: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Akun pengguna tidak ditemukan. Silakan login kembali." },
        { status: 401 }
      );
    }

    // Menyimpan ulasan baru dengan status AKTIF
    const review = await prisma.review.create({
      data: {
        userId: session.userId,
        rating,
        komentar,
        status: "AKTIF",
      },
      include: {
        user: {
          select: {
            id: true,
            nama: true,
            kota: true,
            avatar: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        message: "Ulasan berhasil dikirim.",
        review,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Gagal menyimpan ulasan:", error);

    return NextResponse.json(
      { message: "Terjadi kesalahan saat menyimpan ulasan." },
      { status: 500 }
    );
  }
}
