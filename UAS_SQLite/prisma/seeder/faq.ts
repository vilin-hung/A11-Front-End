import type { PrismaClient } from "../../app/generated/prisma/client";

const faqData = [
  {
    slug: "tentang",
    pertanyaan: "Apa itu Jelajah Rasa Jawa Barat?",
    jawaban:
      "Jelajah Rasa Jawa Barat adalah platform direktori kuliner yang merangkum kekayaan rasa dari berbagai kota dan kabupaten di Jawa Barat.",
    iconClass: "bx bx-info-circle",
    urutan: 1,
  },
  {
    slug: "tambah-kuliner",
    pertanyaan: "Bagaimana cara menambahkan rekomendasi kuliner baru?",
    jawaban:
      "Anda dapat menambahkan hidangan favorit melalui menu yang ada di navigasi samping. Isi formulir informasi makanan seperti nama hidangan, asal daerah, estimasi harga, serta foto kuliner tersebut.",
    iconClass: "bx bx-plus-circle",
    urutan: 2,
  },
  {
    slug: "pembaruan",
    pertanyaan: "Apakah informasi kuliner di sini selalu diperbarui?",
    jawaban:
      "Ya, data kuliner diperbarui secara berkala berdasarkan kontribusi aktif dari pengguna lokal serta proses verifikasi bertahap oleh tim kurator kami.",
    iconClass: "bx bx-refresh",
    urutan: 3,
  },
  {
    slug: "favorit",
    pertanyaan: "Bagaimana cara menyimpan kuliner ke daftar favorit?",
    jawaban:
      "Klik ikon hati pada kuliner yang kamu sukai untuk menyimpannya. Kamu dapat melihat daftar kuliner yang sudah disimpan melalui menu Kuliner Favorit.",
    iconClass: "bx bx-bookmark-heart",
    urutan: 4,
  },
];

export async function seedFaq(prisma: PrismaClient) {
  for (const faq of faqData) {
    await prisma.fAQ.upsert({
      where: { slug: faq.slug },
      update: {
        pertanyaan: faq.pertanyaan,
        jawaban: faq.jawaban,
        iconClass: faq.iconClass,
        urutan: faq.urutan,
        isActive: true,
      },
      create: faq,
    });
  }

  console.log(`Berhasil memasukkan ${faqData.length} data FAQ!`);
}