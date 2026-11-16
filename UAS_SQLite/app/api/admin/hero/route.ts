import { NextResponse } from "next/server";
import { db, now } from "@/lib/db";
import { isAdmin } from "@/lib/userQuery";
import { verifySession } from "@/lib/auth";

const HERO_KEY = "hero_kuliner_ids";

/* Mengambil daftar Kuliner dan pilihan Hero */
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
        `SELECT id, nama, kategori, daerah, gambar FROM Kuliner
         WHERE status = 'APPROVED' AND gambar IS NOT NULL
         ORDER BY nama ASC`
      )
      .all();

    const metadata = db
      .prepare("SELECT value FROM SiteMetadata WHERE key = ?")
      .get(HERO_KEY) as { value: string } | undefined;

    let heroKulinerIds: string[] = [];

    try {
      const parsed = JSON.parse(metadata?.value ?? "[]");

      if (Array.isArray(parsed)) {
        heroKulinerIds = parsed.filter(
          (id): id is string => typeof id === "string"
        );
      }
    } catch {
      heroKulinerIds = [];
    }

    return NextResponse.json({ kuliner, heroKulinerIds });
  } catch (error) {
    console.error("Gagal mengambil pengaturan Hero:", error);

    return NextResponse.json(
      { message: "Gagal mengambil data Hero." },
      { status: 500 }
    );
  }
}

/* Menyimpan pilihan dan urutan Kuliner Hero */
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
    const heroKulinerIds = body.heroKulinerIds;

    if (
      !Array.isArray(heroKulinerIds) ||
      !heroKulinerIds.every((id) => typeof id === "string")
    ) {
      return NextResponse.json(
        { message: "Format pilihan Hero tidak valid." },
        { status: 400 }
      );
    }

    if (new Set(heroKulinerIds).size !== heroKulinerIds.length) {
      return NextResponse.json(
        { message: "Kuliner yang sama tidak boleh dipilih dua kali." },
        { status: 400 }
      );
    }

    let kulinerTerpilih: { id: string }[] = [];

    if (heroKulinerIds.length) {
      const placeholders = heroKulinerIds.map(() => "?").join(", ");

      kulinerTerpilih = db
        .prepare(
          `SELECT id FROM Kuliner
           WHERE id IN (${placeholders})
             AND status = 'APPROVED'
             AND gambar IS NOT NULL`
        )
        .all(...heroKulinerIds) as { id: string }[];
    }

    if (kulinerTerpilih.length !== heroKulinerIds.length) {
      return NextResponse.json(
        {
          message:
            "Ada Kuliner yang tidak ditemukan, belum disetujui, atau belum memiliki gambar.",
        },
        { status: 400 }
      );
    }

    db.prepare(
      `INSERT INTO SiteMetadata (id, key, value, updatedAt)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(key) DO UPDATE SET
         value = excluded.value,
         updatedAt = excluded.updatedAt`
    ).run(
      crypto.randomUUID(),
      HERO_KEY,
      JSON.stringify(heroKulinerIds),
      now()
    );

    return NextResponse.json({
      message: "Hero Carousel berhasil diperbarui.",
      heroKulinerIds,
    });
  } catch (error) {
    console.error("Gagal menyimpan pengaturan Hero:", error);

    return NextResponse.json(
      { message: "Gagal menyimpan pengaturan Hero." },
      { status: 500 }
    );
  }
}
