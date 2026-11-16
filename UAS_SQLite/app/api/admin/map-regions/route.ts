import { NextResponse } from "next/server";
import { db, mapRegion } from "@/lib/db";
import { pastikanAdmin } from "@/lib/userQuery";

export async function GET() {
  try {
    const { galat } = await pastikanAdmin();
    if (galat) return galat;

    const rows = db
      .prepare("SELECT * FROM MapRegion ORDER BY nama ASC")
      .all() as Record<string, unknown>[];

    const jumlah = db
      .prepare(
        `SELECT daerah, COUNT(*) AS jumlah FROM Kuliner
         WHERE status = 'APPROVED' GROUP BY daerah`
      )
      .all() as { daerah: string; jumlah: number }[];

    const jumlahPerDaerah = new Map(
      jumlah.map((item) => [item.daerah.trim().toLowerCase(), item.jumlah])
    );

    const regions = rows.map(mapRegion).map((region) => ({
      ...region,
      jumlahKulinerApproved:
        jumlahPerDaerah.get(region.daerah.trim().toLowerCase()) ?? 0,
    }));

    return NextResponse.json({ regions });
  } catch (error) {
    console.error("Gagal mengambil daerah admin:", error);

    return NextResponse.json(
      { message: "Gagal mengambil data daerah." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { galat } = await pastikanAdmin();
    if (galat) return galat;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { message: "ID daerah tidak ditemukan." },
        { status: 400 }
      );
    }

    const region = db.prepare("SELECT * FROM MapRegion WHERE id = ?").get(id) as
      | { daerah: string }
      | undefined;

    if (!region) {
      return NextResponse.json(
        { message: "Daerah tidak ditemukan." },
        { status: 404 }
      );
    }

    const jumlahKuliner = (
      db
        .prepare(
          "SELECT COUNT(*) AS n FROM Kuliner WHERE LOWER(daerah) = LOWER(?)"
        )
        .get(region.daerah) as { n: number }
    ).n;

    if (jumlahKuliner > 0) {
      return NextResponse.json(
        {
          message: `Daerah tidak bisa dihapus karena masih digunakan oleh ${jumlahKuliner} data kuliner.`,
        },
        { status: 409 }
      );
    }

    db.prepare("DELETE FROM MapRegion WHERE id = ?").run(id);

    return NextResponse.json({ message: "Daerah berhasil dihapus." });
  } catch (error) {
    console.error("Gagal menghapus daerah:", error);

    return NextResponse.json(
      { message: "Gagal menghapus daerah." },
      { status: 500 }
    );
  }
}
