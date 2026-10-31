import { z } from "zod";

// Sesuaikan dengan rentang harga yang diminta di tugas
export const HARGA_MIN = 1000;
export const HARGA_MAX = 1000000;

// Terima array ATAU teks dipisah koma ("pedas, gurih") lalu jadi array string
const daftarTeks = z.preprocess(
  (v) =>
    typeof v === "string"
      ? v.split(",").map((s) => s.trim()).filter(Boolean)
      : v,
  z.array(z.string().trim().min(1)).min(1, "Minimal isi 1 item")
);

const harga = z.coerce
  .number()
  .int("Harus bilangan bulat")
  .min(HARGA_MIN, `Minimal Rp${HARGA_MIN.toLocaleString("id-ID")}`)
  .max(HARGA_MAX, `Maksimal Rp${HARGA_MAX.toLocaleString("id-ID")}`);

export const kulinerSchema = z
  .object({
    nama: z.string().trim().min(3, "Nama minimal 3 karakter").max(100),
    deskripsi: z.string().trim().min(10, "Deskripsi minimal 10 karakter").max(1000),
    kategori: z.string().trim().min(1, "Kategori wajib diisi"),
    daerah: z.string().trim().min(1, "Daerah wajib diisi"),
    bahan: daftarTeks,
    rasa: daftarTeks,
    gambar: z.string().trim().optional().or(z.literal("")),
    hargaMin: harga,
    hargaMax: harga,
  })
  .refine((d) => d.hargaMin <= d.hargaMax, {
    message: "Harga minimum tidak boleh lebih besar dari harga maksimum",
    path: ["hargaMin"],
  });

export type KulinerInput = z.infer<typeof kulinerSchema>;