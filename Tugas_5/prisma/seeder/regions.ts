import type { PrismaClient } from "../../app/generated/prisma/client";

const regions = [
  // kota
  {
    id: "region-kota-bandung",
    nama: "Kota Bandung",
    daerah: "Kota Bandung",
    deskripsi: "Dominan Gurih, Olahan Tapioka, Herbal & Dingin Segar.",
    posisiX: 49,
    posisiY: 61,
  },
  {
    id: "region-kota-bogor",
    nama: "Kota Bogor",
    daerah: "Kota Bogor",
    deskripsi: "Segar Asam-Manis, Olahan Fermentasi (Asinan/Toge Goreng)",
    posisiX: 16,
    posisiY: 42,
  },
  {
    id: "region-kota-cirebon",
    nama: "Kota Cirebon",
    daerah: "Kota Cirebon",
    deskripsi: "Gurih Asin, Kuah Rempah Daging, & Olahan Hasil Laut",
    posisiX: 80,
    posisiY: 45,
  },
  {
    id: "region-kota-tasikmalaya",
    nama: "Kota Tasikmalaya",
    daerah: "Kota Tasikmalaya",
    deskripsi: "Gurih Pedas, Oncom Fermentasi, & Olahan Bakso.",
    posisiX: 69,
    posisiY: 78,
  },
  {
    id: "region-kota-sukabumi",
    nama: "Kota Sukabumi",
    daerah: "Kota Sukabumi",
    deskripsi: "",
    posisiX: 16,
    posisiY: 60,
  },
  {
    id: "region-kota-cianjur",
    nama: "Kota Cianjur",
    daerah: "Kota Cianjur",
    deskripsi: "",
    posisiX: 34,
    posisiY: 60,
  },
  {
    id: "region-kota-indramayu",
    nama: "Kota Indramayu",
    daerah: "Kota Indramayu",
    deskripsi: "",
    posisiX: 70,
    posisiY: 40,
  },
  {
    id: "region-kota-purwakarta",
    nama: "Kota Purwakarta",
    daerah: "Kota Purwakarta",
    deskripsi: "",
    posisiX: 43,
    posisiY: 40,
  },

  // kabupaten
  {
    id: "region-kab-sumedang",
    nama: "Kab. Sumedang",
    daerah: "Kab. Sumedang",
    deskripsi: "Gurih Renyah (Tahu) & Manis Alami (Ubi Cilembu).",
    posisiX: 64,
    posisiY: 51,
  },
  {
    id: "region-kab-garut",
    nama: "Kab. Garut",
    daerah: "Kab. Garut",
    deskripsi: "Manis Legit (Dodol), Gurih Pedas, & Es Goyobod.",
    posisiX: 55,
    posisiY: 73,
  },
  {
    id: "region-kab-subang",
    nama: "Kab. Subang",
    daerah: "Kab. Subang",
    deskripsi: "Manis Asam Segar (Nanas Madu Subang)",
    posisiX: 55,
    posisiY: 38,
  },
  {
    id: "region-kab-karawang",
    nama: "Kab. Karawang",
    daerah: "Kab. Karawang",
    deskripsi: "Manis Pandan (Sorabi Hijau) & Opak Ketan.",
    posisiX: 43,
    posisiY: 32,
  },
  {
    id: "region-kab-pangandaran",
    nama: "Kab. Pangandaran",
    daerah: "Kab. Pangandaran",
    deskripsi: "Asam Gurih Pindang Gunung & Seafood Segar.",
    posisiX: 84,
    posisiY: 80,
  },
  {
    id: "region-kab-bekasi",
    nama: "Kab. Bekasi",
    daerah: "Kab. Bekasi",
    deskripsi: "Gurih Gabus Pucung & Sayur Asem Khas.",
    posisiX: 34,
    posisiY: 30,
  },
  {
    id: "region-kab-cirebon",
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
      update: {},
      create: region,
    });
  }

  console.log(`Berhasil memasukkan ${regions.length} daerah peta!`);
}