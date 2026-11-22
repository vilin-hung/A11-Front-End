import { NextResponse } from "next/server";
import { db, now } from "@/lib/db";
import { isAdmin } from "@/lib/userQuery";
import { verifySession } from "@/lib/auth";

const KATEGORI_REKOMENDASI = {
  makanan: "Makanan",
  jajanan: "Jajanan",
  minuman: "Minuman",
  oleh_oleh: "Oleh-oleh Khas",
} as const;

type KategoriRekomendasi = keyof typeof KATEGORI_REKOMENDASI;

const KEYS = Object.keys(KATEGORI_REKOMENDASI) as KategoriRekomendasi[];

function normalisasiKategori(kategori: string) {
  return kategori.trim().toLowerCase();
}

/* Mengambil pilihan Kuliner yang sudah disetujui */
export async function GET() {
  try {
    const session = await verifySession();

    if (!session || !isAdmin(session.userId)) {
      return NextResponse.json(
        { message: "Akses hanya untuk admin." },
        { status: 403 }
      );
    }

    const kuliner = db
      .prepare(
        `SELECT id, nama, kategori, daerah FROM Kuliner
         WHERE status = 'APPROVED' ORDER BY nama ASC`
      )
      .all();

    const keys = KEYS.map((key) => `featured_${key}`);
    const placeholders = keys.map(() => "?").join(", ");

    const metadata = db
      .prepare(`SELECT key, value FROM SiteMetadata WHERE key IN (${placeholders})`)
      .all(...keys) as { key: string; value: string }[];

    const rekomendasi: Record<KategoriRekomendasi, string> = {
      makanan: "",
      jajanan: "",
      minuman: "",
      oleh_oleh: "",
    };

    for (const item of metadata) {
      const key = item.key.replace("featured_", "") as KategoriRekomendasi;

      if (KEYS.includes(key)) {
        rekomendasi[key] = item.value;
      }
    }

    return NextResponse.json({ kuliner, rekomendasi });
  } catch (error) {
    console.error("Gagal mengambil rekomendasi:", error);

    return NextResponse.json(
      { message: "Gagal mengambil data rekomendasi." },
      { status: 500 }
    );
  }
}

/* Menyimpan pilihan rekomendasi */
export async function PUT(request: Request) {
  try {
    const session = await verifySession();

    if (!session || !isAdmin(session.userId)) {
      return NextResponse.json(
        { message: "Akses hanya untuk admin." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const data = body.rekomendasi;

    if (!data || typeof data !== "object" || Array.isArray(data)) {
      return NextResponse.json(
        { message: "Format rekomendasi tidak valid." },
        { status: 400 }
      );
    }

    for (const key of KEYS) {
      if (typeof data[key] !== "string") {
        return NextResponse.json(
          { message: "Pilihan rekomendasi tidak valid." },
          { status: 400 }
        );
      }
    }

    const pilihan = data as Record<KategoriRekomendasi, string>;

    const selectedIds = KEYS.map((key) => pilihan[key]).filter(
      (id) => id !== ""
    );

    if (new Set(selectedIds).size !== selectedIds.length) {
      return NextResponse.json(
        {
          message: "Satu Kuliner tidak boleh dipilih untuk beberapa kategori.",
        },
        { status: 400 }
      );
    }

    let kulinerTerpilih: { id: string; kategori: string }[] = [];

    if (selectedIds.length) {
      const placeholders = selectedIds.map(() => "?").join(", ");

      kulinerTerpilih = db
        .prepare(
          `SELECT id, kategori FROM Kuliner
           WHERE id IN (${placeholders}) AND status = 'APPROVED'`
        )
        .all(...selectedIds) as { id: string; kategori: string }[];
    }

    if (kulinerTerpilih.length !== selectedIds.length) {
      return NextResponse.json(
        { message: "Kuliner tidak ditemukan atau belum disetujui." },
        { status: 400 }
      );
    }

    for (const key of KEYS) {
      const id = pilihan[key];

      if (id === "") continue;

      const item = kulinerTerpilih.find((kuliner) => kuliner.id === id);

      if (
        !item ||
        normalisasiKategori(item.kategori) !==
          normalisasiKategori(KATEGORI_REKOMENDASI[key])
      ) {
        return NextResponse.json(
          {
            message: `Pilihan untuk kategori ${KATEGORI_REKOMENDASI[key]} tidak sesuai.`,
          },
          { status: 400 }
        );
      }
    }

    const simpan = db.prepare(
      `INSERT INTO SiteMetadata (id, key, value, updatedAt)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(key) DO UPDATE SET
         value = excluded.value,
         updatedAt = excluded.updatedAt`
    );

    const timestamp = now();

    db.transaction(() => {
      for (const key of KEYS) {
        simpan.run(
          crypto.randomUUID(),
          `featured_${key}`,
          pilihan[key],
          timestamp
        );
      }
    })();

    return NextResponse.json({
      message: "Rekomendasi homepage berhasil diperbarui.",
      rekomendasi: pilihan,
    });
  } catch (error) {
    console.error("Gagal menyimpan rekomendasi:", error);

    return NextResponse.json(
      { message: "Gagal menyimpan rekomendasi homepage." },
      { status: 500 }
    );
  }
}
