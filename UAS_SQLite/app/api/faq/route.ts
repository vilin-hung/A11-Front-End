import { NextResponse } from "next/server";
import { db, mapFaq } from "@/lib/db";

export async function GET() {
  try {
    const rows = db
      .prepare(
        "SELECT * FROM FAQ WHERE isActive = 1 ORDER BY urutan ASC"
      )
      .all() as Record<string, unknown>[];

    return NextResponse.json(rows.map(mapFaq));
  } catch (error) {
    console.error("Gagal mengambil data FAQ:", error);

    return NextResponse.json(
      { message: "Gagal mengambil data FAQ" },
      { status: 500 }
    );
  }
}
