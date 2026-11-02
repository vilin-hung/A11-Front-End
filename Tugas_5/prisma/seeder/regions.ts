import type { PrismaClient } from "../../app/generated/prisma/client";

const regions = [
  // kota
  {
    nama: "Kota Bandung",
    daerah: "Kota Bandung",
    deskripsi: "Dominan Gurih, Olahan Tapioka, Herbal & Dingin Segar.",
    posisiX: 49,
    posisiY: 61,
  },
  {
    nama: "Kota Bogor",
    daerah: "Kota Bogor",
    deskripsi: "Segar Asam-Manis, Olahan Fermentasi (Asinan/Toge Goreng)",
    posisiX: 16,
    posisiY: 42,
  },
  {
    nama: "Kota Cirebon",
    daerah: "Kota Cirebon",
    deskripsi: "Gurih Asin, Kuah Rempah Daging, & Olahan Hasil Laut",
    posisiX: 80,
    posisiY: 45,
  },
  {
    nama: "Kota Tasikmalaya",
    daerah: "Kota Tasikmalaya",
    deskripsi: "Gurih Pedas, Oncom Fermentasi, & Olahan Bakso.",
    posisiX: 69,
    posisiY: 78,
  },
  {
    nama: "Kota Sukabumi",
    daerah: "Kota Sukabumi",
    deskripsi: "",
    posisiX: 16,
    posisiY: 60,
  },
  {
    nama: "Kota Cianjur",
    daerah: "Kota Cianjur",
    deskripsi: "",
    posisiX: 34,
    posisiY: 60,
  },
  {
    nama: "Kota Indramayu",
    daerah: "Kota Indramayu",
    deskripsi: "",
    posisiX: 70,
    posisiY: 40,
  },
  {
    nama: "Kota Purwakarta",
    daerah: "Kota Purwakarta",
    deskripsi: "",
    posisiX: 43,
    posisiY: 40,
  },

  // kabupaten
  {
    nama: "Kab. Sumedang",
    daerah: "Kab. Sumedang",
    deskripsi: "Gurih Renyah (Tahu) & Manis Alami (Ubi Cilembu).",
    posisiX: 64,
    posisiY: 51,
  },
  {
    nama: "Kab. Garut",
    daerah: "Kab. Garut",
    deskripsi: "Manis Legit (Dodol), Gurih Pedas, & Es Goyobod.",
    posisiX: 55,
    posisiY: 73,
  },
  {
    nama: "Kab. Subang",
    daerah: "Kab. Subang",
    deskripsi: "Manis Asam Segar (Nanas Madu Subang)",
    posisiX: 55,
    posisiY: 38,
  },
  {
    nama: "Kab. Karawang",
    daerah: "Kab. Karawang",
    deskripsi: "Manis Pandan (Sorabi Hijau) & Opak Ketan.",
    posisiX: 43,
    posisiY: 32,
  },
  {
    nama: "Kab. Pangandaran",
    daerah: "Kab. Pangandaran",
    deskripsi: "Asam Gurih Pindang Gunung & Seafood Segar.",
    posisiX: 84,
    posisiY: 80,
  },
  {
    nama: "Kab. Bekasi",
    daerah: "Kab. Bekasi",
    deskripsi: "Gurih Gabus Pucung & Sayur Asem Khas.",
    posisiX: 34,
    posisiY: 30,
  },
  {
    nama: "Kab. Cirebon",
    daerah: "Kab. Cirebon",
    deskripsi: "Asam Manis Gurih (Tahu Gejrot) & Es Doger.",
    posisiX: 88,
    posisiY: 51,
  },
];

export async function seedRegions(prisma: PrismaClient) {
  for (const region of regions) {
    await prisma.mapRegion.upsert({
      where: { daerah: region.daerah },
      update: {
        // nama: region.nama,
        // deskripsi: region.deskripsi,
        // posisiX: region.posisiX,
        // posisiY: region.posisiY,
        // isActive: true,
      },
      create: region,
    });
  }

  console.log(`Berhasil memasukkan ${regions.length} daerah peta!`);
}