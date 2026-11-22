import { NextResponse } from "next/server";
import { db, mapKuliner } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const item = db
    .prepare("SELECT * FROM Kuliner WHERE id = ? AND status = 'APPROVED'")
    .get(id) as Record<string, unknown> | undefined;

  if (!item) {
    return NextResponse.json({ error: "Tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json(mapKuliner(item));
}
