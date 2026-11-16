/* SQLite tidak mendukung kolom array seperti PostgreSQL (String[]).
   Karena itu `bahan` dan `rasa` disimpan sebagai teks JSON.

   Fungsi di file ini menjadi satu-satunya tempat konversi, supaya
   API tetap mengembalikan bentuk array ke halaman-halaman frontend. */

/* "A, B" | ["A", "B"] | '["A","B"]' -> ["A", "B"] */
export function parseListData(input: unknown): string[] {
  if (!input) return [];

  if (Array.isArray(input)) {
    return input.map((item) => String(item).trim()).filter(Boolean);
  }

  const text = String(input).trim();

  /* Kolom SQLite menyimpan array sebagai teks JSON, mis. '["A","B"]' */
  if (text.startsWith("[")) {
    try {
      const parsed: unknown = JSON.parse(text);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => String(item).trim()).filter(Boolean);
      }
    } catch {
      /* bukan JSON valid, lanjut diperlakukan sebagai teks biasa */
    }
  }

  return text
    .split(",")
    .map((bagian) => bagian.trim())
    .filter(Boolean);
}

/* ["A", "B"] -> '["A","B"]' untuk disimpan ke kolom String */
export function serializeListData(input: unknown): string {
  return JSON.stringify(parseListData(input));
}

/* Baris Kuliner dari database -> bahan/rasa kembali menjadi array */
export function normalizeKuliner<T extends Record<string, unknown>>(row: T) {
  return {
    ...row,
    bahan: parseListData(row.bahan),
    rasa: parseListData(row.rasa),
  };
}

/* Dipakai saat mengembalikan banyak baris sekaligus */
export function normalizeKulinerList<T extends Record<string, unknown>>(
  rows: T[]
) {
  return rows.map(normalizeKuliner);
}
