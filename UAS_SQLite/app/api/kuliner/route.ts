import { NextRequest, NextResponse } from "next/server";
import { db, mapKuliner, mapKulinerList, now, serializeListData, uuid } from "@/lib/db";
import { verifySession } from "@/lib/auth";
import { kulinerSchema } from "@/lib/validations/kuliner";

/* GET /api/kuliner?q=...&kategori=...&daerah=...
   Hanya data APPROVED yang tampil di daftar publik */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim();
    const kategori = searchParams.get("kategori")?.trim();
    const daerah = searchParams.get("daerah")?.trim();

    const where: string[] = ["status = 'APPROVED'"];
    const params: Record<string, string> = {};

    if (q) {
      where.push("(nama LIKE @q OR deskripsi LIKE @q OR daerah LIKE @q)");
      params.q = `%${q}%`;
    }

    if (kategori) {
      where.push("kategori = @kategori");
      params.kategori = kategori;
    }

    if (daerah) {
      where.push("daerah = @daerah");
      params.daerah = daerah;
    }

    const rows = db
      .prepare(
        `SELECT * FROM Kuliner WHERE ${where.join(" AND ")} ORDER BY createdAt DESC`
      )
      .all(params) as Record<string, unknown>[];

    return NextResponse.json(mapKulinerList(rows));
  } catch (error) {
    console.error("GET /api/kuliner error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data kuliner" },
      { status: 500 }
    );
  }
}

/* POST /api/kuliner
   Status SELALU PENDING, tidak boleh ditentukan dari client */
export async function POST(req: NextRequest) {
  const session = await verifySession();

  if (!session) {
    return NextResponse.json(
      { error: "Silakan login terlebih dahulu" },
      { status: 401 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body tidak valid" }, { status: 400 });
  }

  const parsed = kulinerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validasi gagal", detail: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { nama, deskripsi, kategori, daerah, bahan, rasa, gambar, hargaMin, hargaMax } =
    parsed.data;

  try {
    const id = uuid();
    const timestamp = now();

    db.prepare(
      `INSERT INTO Kuliner (
        id, nama, deskripsi, sejarah, kategori, daerah, bahan, rasa,
        gambar, hargaMin, hargaMax, status, catatanAdmin, submittedBy, createdAt, updatedAt
      ) VALUES (?, ?, ?, '', ?, ?, ?, ?, ?, ?, ?, 'PENDING', NULL, ?, ?, ?)`
    ).run(
      id,
      nama,
      deskripsi,
      kategori,
      daerah,
      serializeListData(bahan),
      serializeListData(rasa),
      gambar || null,
      hargaMin,
      hargaMax,
      session.userId,
      timestamp,
      timestamp
    );

    const created = db.prepare("SELECT * FROM Kuliner WHERE id = ?").get(id);

    return NextResponse.json(mapKuliner(created as Record<string, unknown>), {
      status: 201,
    });
  } catch (error) {
    console.error("POST /api/kuliner error:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan kuliner" },
      { status: 500 }
    );
  }
}
