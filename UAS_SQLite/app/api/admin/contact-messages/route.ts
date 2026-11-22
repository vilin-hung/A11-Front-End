import { NextResponse } from "next/server";
import { db, mapMessage, now, uuid } from "@/lib/db";
import { pastikanAdmin } from "@/lib/userQuery";

const STATUS_VALID = ["BARU", "DIPROSES", "SELESAI"];

/* GET: mengambil seluruh pesan masuk */
export async function GET() {
  try {
    const { galat } = await pastikanAdmin();
    if (galat) return galat;

    const rows = db
      .prepare(
        `SELECT m.*, f.id AS faqRefId, f.pertanyaan AS faqRefPertanyaan
         FROM ContactMessage m
         LEFT JOIN FAQ f ON f.id = m.faqId
         ORDER BY m.createdAt DESC`
      )
      .all() as Record<string, unknown>[];

    const messages = rows.map((row) => ({
      ...mapMessage(row),
      faq: row.faqRefId
        ? { id: row.faqRefId, pertanyaan: row.faqRefPertanyaan }
        : null,
    }));

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Gagal mengambil pesan masuk:", error);

    return NextResponse.json(
      { message: "Gagal mengambil pesan masuk." },
      { status: 500 }
    );
  }
}

/* PATCH: mengubah status pesan */
export async function PATCH(request: Request) {
  try {
    const { galat } = await pastikanAdmin();
    if (galat) return galat;

    const body = await request.json().catch(() => ({}));

    // Menjadikan beberapa pesan sebagai referensi FAQ
    if (body.action === "JADIKAN_REFERENSI") {
      const messageIds = body.messageIds;

      if (!Array.isArray(messageIds) || messageIds.length === 0) {
        return NextResponse.json(
          { message: "Pilih minimal satu pesan." },
          { status: 400 }
        );
      }

      const placeholders = messageIds.map(() => "?").join(", ");

      const pesan = db
        .prepare(
          `SELECT id FROM ContactMessage
           WHERE id IN (${placeholders})
             AND status = 'DIPROSES'
             AND faqId IS NULL
             AND isFaqReference = 0`
        )
        .all(...messageIds) as { id: string }[];

      if (pesan.length !== messageIds.length) {
        return NextResponse.json(
          {
            message:
              "Pastikan semua pesan berstatus DIPROSES dan belum terhubung ke FAQ.",
          },
          { status: 400 }
        );
      }

      db.prepare(
        `UPDATE ContactMessage SET isFaqReference = 1 WHERE id IN (${placeholders})`
      ).run(...messageIds);

      return NextResponse.json({
        message: "Pesan berhasil disimpan sebagai referensi FAQ.",
      });
    }

    if (!body.id || !body.status) {
      return NextResponse.json(
        { message: "ID dan status pesan wajib diisi." },
        { status: 400 }
      );
    }

    if (!STATUS_VALID.includes(body.status)) {
      return NextResponse.json(
        { message: "Status pesan tidak dikenali." },
        { status: 400 }
      );
    }

    const result = db
      .prepare("UPDATE ContactMessage SET status = ? WHERE id = ?")
      .run(body.status, body.id);

    if (result.changes === 0) {
      return NextResponse.json(
        { message: "Pesan tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Status pesan berhasil diperbarui.",
      data: mapMessage(
        db.prepare("SELECT * FROM ContactMessage WHERE id = ?").get(body.id) as Record<
          string,
          unknown
        >
      ),
    });
  } catch (error) {
    console.error("Gagal mengubah pesan:", error);

    return NextResponse.json(
      { message: "Gagal mengubah pesan." },
      { status: 500 }
    );
  }
}
