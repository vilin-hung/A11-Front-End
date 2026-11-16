import { NextResponse } from "next/server";
import { db, mapKuliner } from "@/lib/db";

/* GET: Mengambil daftar favorit pengguna */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { message: "userId wajib diisi" },
        { status: 400 }
      );
    }

    const rows = db
      .prepare(
        `SELECT f.userId, f.kulinerId, f.createdAt, k.*
         FROM Favorite f
         JOIN Kuliner k ON k.id = f.kulinerId
         WHERE f.userId = ?
         ORDER BY f.createdAt DESC`
      )
      .all(userId) as Record<string, unknown>[];

    const favorites = rows.map((row) => ({
      userId: row.userId,
      kulinerId: row.kulinerId,
      createdAt: row.createdAt,
      kuliner: mapKuliner(row),
    }));

    return NextResponse.json(favorites);
  } catch (error) {
    console.error("Gagal mengambil favorit:", error);

    return NextResponse.json(
      { message: "Gagal mengambil data favorit" },
      { status: 500 }
    );
  }
}

/* POST: Menambahkan kuliner ke daftar favorit */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, kulinerId } = body;

    if (!userId || !kulinerId) {
      return NextResponse.json(
        { message: "userId dan kulinerId wajib diisi" },
        { status: 400 }
      );
    }

    db.prepare(
      `INSERT INTO Favorite (userId, kulinerId, createdAt)
       VALUES (?, ?, ?)
       ON CONFLICT(userId, kulinerId) DO NOTHING`
    ).run(userId, kulinerId, new Date().toISOString());

    const favorite = db
      .prepare("SELECT * FROM Favorite WHERE userId = ? AND kulinerId = ?")
      .get(userId, kulinerId);

    return NextResponse.json(favorite, { status: 201 });
  } catch (error) {
    console.error("Gagal menambahkan favorit:", error);

    return NextResponse.json(
      { message: "Gagal menambahkan favorit" },
      { status: 500 }
    );
  }
}

/* DELETE: Menghapus kuliner dari daftar favorit */
export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { userId, kulinerId } = body;

    if (!userId || !kulinerId) {
      return NextResponse.json(
        { message: "userId dan kulinerId wajib diisi" },
        { status: 400 }
      );
    }

    const result = db
      .prepare("DELETE FROM Favorite WHERE userId = ? AND kulinerId = ?")
      .run(userId, kulinerId);

    if (result.changes === 0) {
      return NextResponse.json(
        { message: "Favorit tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Favorit berhasil dihapus" });
  } catch (error) {
    console.error("Gagal menghapus favorit:", error);

    return NextResponse.json(
      { message: "Gagal menghapus favorit" },
      { status: 500 }
    );
  }
}
