import { NextResponse } from "next/server";
import { db, now, uuid } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { email, subjek, pesan } = body;

    if (!email || !subjek || !pesan) {
      return NextResponse.json(
        { message: "Semua field wajib diisi." },
        { status: 400 }
      );
    }

    const id = uuid();

    db.prepare(
      `INSERT INTO ContactMessage (id, email, subjek, pesan, status, isFaqReference, faqId, createdAt)
       VALUES (?, ?, ?, ?, 'BARU', 0, NULL, ?)`
    ).run(id, email, subjek, pesan, now());

    const contactMessage = db
      .prepare("SELECT * FROM ContactMessage WHERE id = ?")
      .get(id);

    return NextResponse.json(
      { message: "Pesan berhasil dikirim.", data: contactMessage },
      { status: 201 }
    );
  } catch (error) {
    console.error("Gagal menyimpan pesan:", error);

    return NextResponse.json(
      { message: "Terjadi kesalahan saat mengirim pesan." },
      { status: 500 }
    );
  }
}
