import type { PrismaClient } from "../../app/generated/prisma/client";

const dataReview = [
  {
    email: "mei@gmail.com",
    rating: 5,
    komentar:
      "Website ini sangat membantu untuk mengenal berbagai macam kuliner Nusantara.",
  },
  {
    email: "bagus@gmail.com",
    rating: 4,
    komentar:
      "Tampilannya menarik dan informasinya cukup lengkap. Semoga pilihan kulinernya semakin banyak.",
  },
];

export async function seedReviews(prisma: PrismaClient) {
  let jumlahDitambahkan = 0;

  for (const review of dataReview) {
    // Mengambil pengguna berdasarkan email
    const user = await prisma.user.findUnique({
      where: {
        email: review.email,
      },
    });

    if (!user) {
      throw new Error(`Pengguna ${review.email} tidak ditemukan.`);
    }

    // Memeriksa apakah ulasan contoh sudah tersedia
    const existingReview = await prisma.review.findFirst({
      where: {
        userId: user.id,
        rating: review.rating,
        komentar: review.komentar,
      },
    });

    if (existingReview) {
      continue;
    }

    // Memasukkan ulasan contoh
    await prisma.review.create({
      data: {
        userId: user.id,
        rating: review.rating,
        komentar: review.komentar,
        status: "AKTIF",
      },
    });

    jumlahDitambahkan++;
  }

  console.log(`Berhasil memasukkan ${jumlahDitambahkan} data ulasan!`);
}