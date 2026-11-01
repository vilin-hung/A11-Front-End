import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { kulinerSchema } from "@/lib/validations/kuliner";

// GET /api/kuliner?q=...&kategori=...&daerah=...
// Hanya data APPROVED yang tampil di daftar publik
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim();
    const kategori = searchParams.get("kategori")?.trim();
    const daerah = searchParams.get("daerah")?.trim();

    const data = await prisma.kuliner.findMany({
      where: {
        status: "APPROVED",
        ...(q && {
          OR: [
            { nama: { contains: q, mode: "insensitive" } },
            { deskripsi: { contains: q, mode: "insensitive" } },
            { daerah: { contains: q, mode: "insensitive" } },
          ],
        }),
        ...(kategori && { kategori }),
        ...(daerah && { daerah }),
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("GET /api/kuliner error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data kuliner" },
      { status: 500 }
    );
  }
}

// POST /api/kuliner
// Status SELALU PENDING, tidak boleh ditentukan dari client
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body tidak valid" }, { status: 400 });
  }

  const parsed = kulinerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validasi gagal", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { nama, deskripsi, kategori, daerah, bahan, rasa, gambar, hargaMin, hargaMax } =
    parsed.data;

  try {
    const created = await prisma.kuliner.create({
      data: {
        nama,
        deskripsi,
        kategori,
        daerah,
        bahan,
        rasa,
        gambar: gambar || null,
        hargaMin,
        hargaMax,
        status: "PENDING", // dipaksa di server
        // catatanAdmin dan submittedBy sengaja tidak diambil dari client
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("POST /api/kuliner error:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan kuliner" },
      { status: 500 }
    );
  }
}