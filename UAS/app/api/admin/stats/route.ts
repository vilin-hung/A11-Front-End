import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";

/* Kategori yang dipakai di form tambah kuliner */
const DAFTAR_KATEGORI = [
  "Makanan",
  "Jajanan",
  "Minuman",
  "Oleh-Oleh Khas",
];

/* GET: ringkasan angka untuk dashboard admin. Semua dihitung dari
   database, bukan dari penyimpanan browser. */
export async function GET() {
  try {
    const session = await verifySession();

    if (!session) {
      return NextResponse.json(
        { message: "Silakan login terlebih dahulu." },
        { status: 401 }
      );
    }

    const admin = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { role: true },
    });

    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Akses hanya untuk admin." },
        { status: 403 }
      );
    }

    const totalPengguna = await prisma.user.count();
    const kulinerApproved = await prisma.kuliner.count({
      where: { status: "APPROVED" },
    });
    const kulinerPending = await prisma.kuliner.count({
      where: { status: "PENDING" },
    });
    const kulinerRejected = await prisma.kuliner.count({
      where: { status: "REJECTED" },
    });
    const totalUlasan = await prisma.review.count();
    const totalFavorit = await prisma.favorite.count();

    /* Kategori yang belum punya kuliner tetap dikirim dengan nilai 0
       supaya kotak statistiknya tidak hilang. */
    const jumlahKategori: { [kategori: string]: number } = {};

    DAFTAR_KATEGORI.forEach((kategori) => {
      jumlahKategori[kategori] = 0;
    });

    const semuaKuliner = await prisma.kuliner.findMany({
      where: { status: "APPROVED" },
      select: { kategori: true, daerah: true },
    });

    const hitungDaerah: { [daerah: string]: number } = {};

    semuaKuliner.forEach((item) => {
      jumlahKategori[item.kategori] = (jumlahKategori[item.kategori] ?? 0) + 1;

      const daerah = item.daerah.replace(/^Kabupaten /, "Kab. ");
      hitungDaerah[daerah] = (hitungDaerah[daerah] ?? 0) + 1;
    });

    /* Sebaran daerah diurutkan dari yang paling banyak. */
    const sebaranDaerah = Object.keys(hitungDaerah)
      .map((daerah) => ({ daerah, jumlah: hitungDaerah[daerah] }))
      .sort((a, b) => b.jumlah - a.jumlah);

    /* Top 5 kuliner terfavorit */
    const semuaFavorit = await prisma.favorite.findMany({
      select: { kulinerId: true },
    });

    const hitungFavorit: { [id: string]: number } = {};

    semuaFavorit.forEach((item) => {
      hitungFavorit[item.kulinerId] = (hitungFavorit[item.kulinerId] ?? 0) + 1;
    });

    const limaId = Object.keys(hitungFavorit)
      .sort((a, b) => hitungFavorit[b] - hitungFavorit[a])
      .slice(0, 5);

    const detailKuliner = await prisma.kuliner.findMany({
      where: { id: { in: limaId } },
      select: { id: true, nama: true, kategori: true },
    });

    const topFavorit = limaId
      .map((id) => {
        const kuliner = detailKuliner.find((item) => item.id === id);

        if (!kuliner) return null;

        return {
          id: kuliner.id,
          nama: kuliner.nama,
          kategori: kuliner.kategori,
          jumlah: hitungFavorit[id],
        };
      })
      .filter((baris) => baris !== null);

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
