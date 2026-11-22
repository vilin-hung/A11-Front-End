import { connection, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { pastikanAdmin } from "@/lib/userQuery";

/* Kategori yang dipakai di form tambah kuliner */
const DAFTAR_KATEGORI = ["Makanan", "Jajanan", "Minuman", "Oleh-Oleh Khas"];

/* GET: ringkasan angka untuk dashboard admin. Semua dihitung dari
   database, bukan dari penyimpanan browser. */
export async function GET() {
  await connection();

  try {
    const { galat } = await pastikanAdmin();
    if (galat) return galat;

    const hitung = (sql: string) => (db.prepare(sql).get() as { n: number }).n;

    const totalPengguna = hitung("SELECT COUNT(*) AS n FROM User");
    const kulinerApproved = hitung(
      "SELECT COUNT(*) AS n FROM Kuliner WHERE status = 'APPROVED'"
    );
    const kulinerPending = hitung(
      "SELECT COUNT(*) AS n FROM Kuliner WHERE status = 'PENDING'"
    );
    const kulinerRejected = hitung(
      "SELECT COUNT(*) AS n FROM Kuliner WHERE status = 'REJECTED'"
    );
    const totalUlasan = hitung("SELECT COUNT(*) AS n FROM Review");
    const totalFavorit = hitung("SELECT COUNT(*) AS n FROM Favorite");

    /* Kategori yang belum punya kuliner tetap dikirim dengan nilai 0
       supaya kotak statistiknya tidak hilang. */
    const jumlahKategori: Record<string, number> = {};

    DAFTAR_KATEGORI.forEach((kategori) => {
      jumlahKategori[kategori] = 0;
    });

    const semuaKuliner = db
      .prepare(
        "SELECT kategori, daerah FROM Kuliner WHERE status = 'APPROVED'"
      )
      .all() as { kategori: string; daerah: string }[];

    const hitungDaerah: Record<string, number> = {};

    semuaKuliner.forEach((item) => {
      jumlahKategori[item.kategori] = (jumlahKategori[item.kategori] ?? 0) + 1;

      const daerah = item.daerah.replace(/^Kabupaten /, "Kab. ");
      hitungDaerah[daerah] = (hitungDaerah[daerah] ?? 0) + 1;
    });

    const sebaranDaerah = Object.keys(hitungDaerah)
      .map((daerah) => ({ daerah, jumlah: hitungDaerah[daerah] }))
      .sort((a, b) => b.jumlah - a.jumlah);

    /* Top 5 kuliner terfavorit */
    const topFavorit = (
      db
        .prepare(
          `SELECT k.id, k.nama, k.kategori, COUNT(f.userId) AS jumlah
           FROM Favorite f
           JOIN Kuliner k ON k.id = f.kulinerId
           GROUP BY f.kulinerId
           ORDER BY jumlah DESC
           LIMIT 5`
        )
        .all() as { id: string; nama: string; kategori: string; jumlah: number }[]
    ).map((item) => ({
      id: item.id,
      nama: item.nama,
      kategori: item.kategori,
      jumlah: item.jumlah,
    }));

    return NextResponse.json({
      totalPengguna,
      kulinerApproved,
      kulinerPending,
      kulinerRejected,
      totalUlasan,
      totalFavorit,
      perKategori: jumlahKategori,
      sebaranDaerah,
      topFavorit,
    });
  } catch (error) {
    console.error("Gagal mengambil statistik admin:", error);

    return NextResponse.json(
      { message: "Gagal mengambil statistik admin." },
      { status: 500 }
    );
  }
}
