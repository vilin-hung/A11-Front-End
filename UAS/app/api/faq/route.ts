import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const faq = await prisma.fAQ.findMany({
      where: { isActive: true },
      orderBy: { urutan: "asc" },
    });

    return NextResponse.json(faq);
  } catch (error) {
    console.error("Gagal mengambil data FAQ:", error);

    return NextResponse.json(
      { message: "Gagal mengambil data FAQ" },
      { status: 500 }
    );
  }
}