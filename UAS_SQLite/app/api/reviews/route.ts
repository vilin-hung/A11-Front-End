import { NextResponse } from "next/server";
import { db, now, uuid } from "@/lib/db";
import { verifySession } from "@/lib/auth";

/* Mengambil seluruh ulasan yang berstatus AKTIF untuk ditampilkan di Home */
export async function GET() {
  try {
    const rows = db
      .prepare(
        `SELECT r.*, u.nama AS userName, u.kota AS userKota, u.avatar AS userAvatar
         FROM Review r
         JOIN User u ON u.id = r.userId
         WHERE r.status = 'AKTIF'
         ORDER BY r.createdAt DESC`
      )
      .all() as Record<string, unknown>[];

    const reviews = rows.map((row) => ({
      id: row.id,
      userId: row.userId,
      rating: row.rating,
      komentar: row.komentar,
      status: row.status,
      createdAt: row.createdAt,
      user: {
        id: row.userId,
        nama: row.userName,
        kota: row.userKota,
        avatar: row.userAvatar,
      },
    }));

    return NextResponse.json({ reviews });
  } catch (error) {
    console.error("Gagal mengambil ulasan:", error);

    return NextResponse.json(
      { message: "Gagal mengambil data ulasan." },
      { status: 500 }
    );
  }
}

/* Menyimpan ulasan baru dari pengguna yang sudah login */
export async function POST(request: Request) {
  try {
    const session = await verifySession();

    if (!session) {
      return NextResponse.json(
        { message: "Silakan login terlebih dahulu untuk menulis ulasan." },
        { status: 401 }
      );
    }

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

    if (!komentar || komentar.length > 1000) {
      return NextResponse.json(
        { message: "Komentar wajib diisi dan maksimal 1000 karakter." },
        { status: 400 }
      );
    }

    const user = db
      .prepare(
        "SELECT id, nama, kota, avatar FROM User WHERE id = ?"
      )
      .get(session.userId) as Record<string, unknown> | undefined;

    if (!user) {
      return NextResponse.json(
        { message: "Akun pengguna tidak ditemukan. Silakan login kembali." },
        { status: 401 }
      );
    }

    const id = uuid();
    const createdAt = now();

    db.prepare(
      `INSERT INTO Review (id, userId, rating, komentar, status, createdAt)
       VALUES (?, ?, ?, ?, 'AKTIF', ?)`
    ).run(id, session.userId, rating, komentar, createdAt);

    return NextResponse.json(
      {
        message: "Ulasan berhasil dikirim.",
        review: {
          id,
          userId: session.userId,
          rating,
          komentar,
          status: "AKTIF",
          createdAt,
          user: {
            id: user.id,
            nama: user.nama,
            kota: user.kota,
            avatar: user.avatar,
          },
        },
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
