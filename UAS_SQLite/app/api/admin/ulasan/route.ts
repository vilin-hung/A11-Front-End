import { NextResponse } from "next/server";
import { db, mapKulinerList } from "@/lib/db";
import { pastikanAdmin } from "@/lib/userQuery";

const STATUS_VALID = ["AKTIF", "NONAKTIF"];

/* GET: seluruh ulasan beserta data penggunanya. */
export async function GET() {
  try {
    const { galat } = await pastikanAdmin();
    if (galat) return galat;

    const rows = db
      .prepare(
        `SELECT r.*, u.nama AS userName
         FROM Review r
         JOIN User u ON u.id = r.userId
         ORDER BY r.createdAt DESC`
      )
      .all() as Record<string, unknown>[];

    const ulasan = rows.map((row) => ({
      id: row.id,
      userId: row.userId,
      rating: row.rating,
      komentar: row.komentar,
      status: row.status,
      createdAt: row.createdAt,
      user: { nama: row.userName },
    }));

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

    const result = db
      .prepare("UPDATE Review SET status = ? WHERE id = ?")
      .run(body.status, body.id);

    if (result.changes === 0) {
      return NextResponse.json(
        { message: "Ulasan tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Status ulasan berhasil diperbarui.",
      ulasan: db.prepare("SELECT * FROM Review WHERE id = ?").get(body.id),
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

    const result = db.prepare("DELETE FROM Review WHERE id = ?").run(body.id);

    if (result.changes === 0) {
      return NextResponse.json(
        { message: "Ulasan tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Ulasan berhasil dihapus." });
  } catch (error) {
    console.error("Gagal menghapus ulasan:", error);

    return NextResponse.json(
      { message: "Gagal menghapus ulasan." },
      { status: 500 }
    );
  }
}
