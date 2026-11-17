import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

    const contactMessage = await prisma.contactMessage.create({
      data: {
        email,
        subjek,
        pesan,
      },
    });

    return NextResponse.json(
      {
        message: "Pesan berhasil dikirim.",
        data: contactMessage,
      },
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