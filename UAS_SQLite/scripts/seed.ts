import "dotenv/config";

import { hash } from "bcryptjs";

import { db, now, serializeListData, uuid } from "../lib/db";
import { dataKuliner } from "./data/kuliner";
import { faqData } from "./data/faq";
import { metadataData } from "./data/metadata";
import { dataReview } from "./data/review";
import { dataUser } from "./data/users";
import { regions } from "../app/data/regions";

/* Seed idempoten: aman dijalankan berulang. Pakai --reset untuk
   mengosongkan seluruh tabel lebih dulu. */

const reset = process.argv.includes("--reset");

async function main() {
  if (reset) {
    db.exec(`
      DELETE FROM ContactMessage;
      DELETE FROM Favorite;
      DELETE FROM Review;
      DELETE FROM Kuliner;
      DELETE FROM FAQ;
      DELETE FROM MapRegion;
      DELETE FROM SiteMetadata;
      DELETE FROM User;
    `);
    console.log("Database dikosongkan.");
  }

  /* ---------- pengguna ---------- */
  const insertUser = db.prepare(`
    INSERT INTO User (id, nama, email, passwordHash, role, kota, avatar, createdAt, updatedAt)
    VALUES (@id, @nama, @email, @passwordHash, @role, @kota, NULL, @createdAt, @updatedAt)
    ON CONFLICT(email) DO UPDATE SET
      nama = excluded.nama,
      passwordHash = excluded.passwordHash,
      role = excluded.role,
      kota = excluded.kota,
      updatedAt = excluded.updatedAt
  `);

  for (const user of dataUser) {
    const timestamp = now();

    insertUser.run({
      id: uuid(),
      nama: user.nama,
      email: user.email,
      passwordHash: await hash(user.password, 12),
      role: user.role,
      kota: user.kota,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
  }

  console.log(`Berhasil memasukkan ${dataUser.length} data pengguna!`);

  /* ---------- kuliner ---------- */
  const insertKuliner = db.prepare(`
    INSERT INTO Kuliner (
      id, nama, deskripsi, sejarah, kategori, daerah, bahan, rasa,
      gambar, hargaMin, hargaMax, status, catatanAdmin, submittedBy, createdAt, updatedAt
    ) VALUES (
      @id, @nama, @deskripsi, @sejarah, @kategori, @daerah, @bahan, @rasa,
      @gambar, @hargaMin, @hargaMax, @status, NULL, NULL, @createdAt, @updatedAt
    )
    ON CONFLICT(id) DO UPDATE SET
      nama = excluded.nama,
      deskripsi = excluded.deskripsi,
      sejarah = excluded.sejarah,
      kategori = excluded.kategori,
      daerah = excluded.daerah,
      bahan = excluded.bahan,
      rasa = excluded.rasa,
      gambar = excluded.gambar,
      hargaMin = excluded.hargaMin,
      hargaMax = excluded.hargaMax,
      status = excluded.status,
      updatedAt = excluded.updatedAt
  `);

  for (const item of dataKuliner) {
    const timestamp = now();

    insertKuliner.run({
      id: item.id,
      nama: item.nama,
      deskripsi: item.deskripsi,
      sejarah: item.sejarah,
      kategori: item.kategori,
      daerah: item.daerah,
      bahan: serializeListData(item.bahan),
      rasa: serializeListData(item.rasa),
      gambar: item.gambar,
      hargaMin: item.hargaMin,
      hargaMax: item.hargaMax,
      status: item.status,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
  }

  console.log(`Berhasil memasukkan ${dataKuliner.length} data kuliner!`);

  /* ---------- FAQ ---------- */
  const insertFaq = db.prepare(`
    INSERT INTO FAQ (id, pertanyaan, jawaban, urutan, isActive, createdAt, updatedAt, iconClass, slug)
    VALUES (@id, @pertanyaan, @jawaban, @urutan, 1, @createdAt, @updatedAt, @iconClass, @slug)
    ON CONFLICT(slug) DO UPDATE SET
      pertanyaan = excluded.pertanyaan,
      jawaban = excluded.jawaban,
      urutan = excluded.urutan,
      isActive = 1,
      iconClass = excluded.iconClass,
      updatedAt = excluded.updatedAt
  `);

  for (const faq of faqData) {
    const timestamp = now();

    insertFaq.run({
      id: uuid(),
      pertanyaan: faq.pertanyaan,
      jawaban: faq.jawaban,
      urutan: faq.urutan,
      iconClass: faq.iconClass,
      slug: faq.slug,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
  }

  console.log(`Berhasil memasukkan ${faqData.length} data FAQ!`);

  /* ---------- daerah peta ---------- */
  const insertRegion = db.prepare(`
    INSERT INTO MapRegion (id, nama, daerah, deskripsi, posisiX, posisiY, isActive)
    VALUES (@id, @nama, @daerah, @deskripsi, @posisiX, @posisiY, 1)
    ON CONFLICT(daerah) DO NOTHING
  `);

  for (const region of regions) {
    insertRegion.run(region);
  }

  console.log(`Berhasil memasukkan ${regions.length} daerah peta!`);

  /* ---------- metadata website ---------- */
  const insertMetadata = db.prepare(`
    INSERT INTO SiteMetadata (id, key, value, updatedAt)
    VALUES (@id, @key, @value, @updatedAt)
    ON CONFLICT(key) DO NOTHING
  `);

  for (const metadata of metadataData) {
    insertMetadata.run({
      id: uuid(),
      key: metadata.key,
      value: metadata.value,
      updatedAt: now(),
    });
  }

  console.log(`Berhasil memasukkan ${metadataData.length} metadata website!`);

  /* ---------- ulasan contoh ---------- */
  const findUser = db.prepare("SELECT id FROM User WHERE email = ?");
  const findReview = db.prepare(`
    SELECT id FROM Review WHERE userId = ? AND rating = ? AND komentar = ?
  `);
  const insertReview = db.prepare(`
    INSERT INTO Review (id, userId, rating, komentar, status, createdAt)
    VALUES (@id, @userId, @rating, @komentar, 'AKTIF', @createdAt)
  `);

  let jumlahUlasan = 0;

  for (const review of dataReview) {
    const user = findUser.get(review.email) as { id: string } | undefined;

    if (!user) {
      throw new Error(`Pengguna ${review.email} tidak ditemukan.`);
    }

    if (findReview.get(user.id, review.rating, review.komentar)) continue;

    insertReview.run({
      id: uuid(),
      userId: user.id,
      rating: review.rating,
      komentar: review.komentar,
      createdAt: now(),
    });

    jumlahUlasan++;
  }

  console.log(`Berhasil memasukkan ${jumlahUlasan} data ulasan!`);

  /* Hentikan koneksi supaya proses tidak menggantung. */
  db.close();
}

main().catch((error) => {
  console.error("Gagal menjalankan seed:", error);
  process.exitCode = 1;
});
