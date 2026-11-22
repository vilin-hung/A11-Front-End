import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

/* Koneksi SQLite tunggal. File database dibuat otomatis saat pertama kali
   dijalankan, begitu juga tabel-tabelnya. */
const DB_PATH = process.env.DATABASE_FILE
  ? path.resolve(process.cwd(), process.env.DATABASE_FILE)
  : path.join(process.cwd(), "data", "jelajahrasa.db");

const globalForDb = globalThis as unknown as {
  sqlite: Database.Database | undefined;
};

function createDatabase() {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

  const db = new Database(DB_PATH);

  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  db.exec(`
    CREATE TABLE IF NOT EXISTS User (
      id           TEXT PRIMARY KEY,
      nama         TEXT NOT NULL,
      email        TEXT NOT NULL UNIQUE,
      passwordHash TEXT NOT NULL,
      role         TEXT NOT NULL DEFAULT 'USER',
      kota         TEXT,
      avatar       TEXT,
      createdAt    TEXT NOT NULL,
      updatedAt    TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS Kuliner (
      id           TEXT PRIMARY KEY,
      nama         TEXT NOT NULL,
      deskripsi    TEXT NOT NULL,
      sejarah      TEXT NOT NULL DEFAULT '',
      kategori     TEXT NOT NULL,
      daerah       TEXT NOT NULL,
      /* SQLite tidak punya tipe array: bahan/rasa disimpan sebagai teks JSON */
      bahan        TEXT NOT NULL DEFAULT '[]',
      rasa         TEXT NOT NULL DEFAULT '[]',
      gambar       TEXT,
      hargaMin     INTEGER NOT NULL DEFAULT 0,
      hargaMax     INTEGER NOT NULL DEFAULT 0,
      status       TEXT NOT NULL DEFAULT 'PENDING',
      catatanAdmin TEXT,
      submittedBy  TEXT REFERENCES User(id) ON DELETE SET NULL,
      createdAt    TEXT NOT NULL,
      updatedAt    TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS Kuliner_status_idx   ON Kuliner(status);
    CREATE INDEX IF NOT EXISTS Kuliner_kategori_idx ON Kuliner(kategori);
    CREATE INDEX IF NOT EXISTS Kuliner_daerah_idx   ON Kuliner(daerah);

    CREATE TABLE IF NOT EXISTS Favorite (
      userId    TEXT NOT NULL REFERENCES User(id) ON DELETE CASCADE,
      kulinerId TEXT NOT NULL REFERENCES Kuliner(id) ON DELETE CASCADE,
      createdAt TEXT NOT NULL,
      PRIMARY KEY (userId, kulinerId)
    );

    CREATE INDEX IF NOT EXISTS Favorite_kulinerId_idx ON Favorite(kulinerId);

    CREATE TABLE IF NOT EXISTS Review (
      id        TEXT PRIMARY KEY,
      userId    TEXT NOT NULL REFERENCES User(id) ON DELETE CASCADE,
      rating    INTEGER NOT NULL,
      komentar  TEXT NOT NULL,
      status    TEXT NOT NULL DEFAULT 'AKTIF',
      createdAt TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS Review_status_idx    ON Review(status);
    CREATE INDEX IF NOT EXISTS Review_createdAt_idx ON Review(createdAt);

    CREATE TABLE IF NOT EXISTS FAQ (
      id         TEXT PRIMARY KEY,
      pertanyaan TEXT NOT NULL,
      jawaban    TEXT NOT NULL,
      urutan     INTEGER NOT NULL DEFAULT 0,
      isActive   INTEGER NOT NULL DEFAULT 1,
      createdAt  TEXT NOT NULL,
      updatedAt  TEXT NOT NULL,
      iconClass  TEXT NOT NULL DEFAULT 'bx bx-info-circle',
      slug       TEXT NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS SiteMetadata (
      id        TEXT PRIMARY KEY,
      key       TEXT NOT NULL UNIQUE,
      value     TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS MapRegion (
      id        TEXT PRIMARY KEY,
      nama      TEXT NOT NULL,
      daerah    TEXT NOT NULL UNIQUE,
      deskripsi TEXT NOT NULL,
      posisiX   REAL NOT NULL DEFAULT 50,
      posisiY   REAL NOT NULL DEFAULT 50,
      isActive  INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS ContactMessage (
      id             TEXT PRIMARY KEY,
      email          TEXT NOT NULL,
      subjek         TEXT NOT NULL,
      pesan          TEXT NOT NULL,
      status         TEXT NOT NULL DEFAULT 'BARU',
      isFaqReference INTEGER NOT NULL DEFAULT 0,
      faqId          TEXT REFERENCES FAQ(id) ON DELETE SET NULL,
      createdAt      TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS ContactMessage_status_idx    ON ContactMessage(status);
    CREATE INDEX IF NOT EXISTS ContactMessage_createdAt_idx ON ContactMessage(createdAt);
    CREATE INDEX IF NOT EXISTS ContactMessage_faqId_idx     ON ContactMessage(faqId);
  `);

  return db;
}

export const db = globalForDb.sqlite ?? createDatabase();

if (process.env.NODE_ENV !== "production") {
  globalForDb.sqlite = db;
}

/* ---------- helper umum ---------- */

export function now() {
  return new Date().toISOString();
}

export function uuid() {
  return crypto.randomUUID();
}

/* "A, B" | ["A","B"] | '["A","B"]' -> ["A","B"] */
export function parseListData(input: unknown): string[] {
  if (!input) return [];

  if (Array.isArray(input)) {
    return input.map((item) => String(item).trim()).filter(Boolean);
  }

  const text = String(input).trim();

  if (text.startsWith("[")) {
    try {
      const parsed: unknown = JSON.parse(text);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => String(item).trim()).filter(Boolean);
      }
    } catch {
      /* bukan JSON valid, diperlakukan sebagai teks biasa */
    }
  }

  return text
    .split(",")
    .map((bagian) => bagian.trim())
    .filter(Boolean);
}

/* ["A","B"] -> '["A","B"]' untuk disimpan ke kolom TEXT */
export function serializeListData(input: unknown): string {
  return JSON.stringify(parseListData(input));
}

/* ---------- mapper baris database -> bentuk yang dipakai frontend ---------- */

type Row = Record<string, unknown>;

export function mapUser(row: Row) {
  return row as {
    id: string;
    nama: string;
    email: string;
    kota: string | null;
    avatar: string | null;
    role: string;
    createdAt?: string;
  };
}

export type KulinerRow = {
  id: string;
  nama: string;
  deskripsi: string;
  sejarah: string;
  kategori: string;
  daerah: string;
  gambar: string | null;
  hargaMin: number;
  hargaMax: number;
  status: string;
  catatanAdmin: string | null;
  submittedBy: string | null;
  createdAt: string;
  updatedAt: string;
  userNama?: string;
};

export type Kuliner = Omit<KulinerRow, "bahan" | "rasa"> & {
  bahan: string[];
  rasa: string[];
};

export function mapKuliner(row: Row): Kuliner & { userNama?: string } {
  const { bahan, rasa, ...rest } = row as Row & {
    bahan: unknown;
    rasa: unknown;
  };

  return {
    ...(rest as unknown as KulinerRow),
    bahan: parseListData(bahan),
    rasa: parseListData(rasa),
  };
}

export function mapKulinerList(rows: Row[]) {
  return rows.map(mapKuliner);
}

export type Faq = {
  id: string;
  pertanyaan: string;
  jawaban: string;
  urutan: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  iconClass: string;
  slug: string;
};

export function mapFaq(row: Row): Faq {
  return {
    ...(row as unknown as Omit<Faq, "isActive">),
    isActive: Boolean(row.isActive),
  };
}

export type MapRegion = {
  id: string;
  nama: string;
  daerah: string;
  deskripsi: string;
  posisiX: number;
  posisiY: number;
  isActive: boolean;
};

export function mapRegion(row: Row): MapRegion {
  return {
    ...(row as unknown as Omit<MapRegion, "isActive">),
    isActive: Boolean(row.isActive),
  };
}

export function mapMessage(row: Row) {
  return {
    ...row,
    isFaqReference: Boolean(row.isFaqReference),
  };
}
