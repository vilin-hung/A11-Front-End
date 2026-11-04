-- Memastikan tidak ada ulasan tanpa pengguna
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM "Review"
        WHERE "userId" IS NULL
    ) THEN
        RAISE EXCEPTION
        'Migration dibatalkan: terdapat ulasan dengan userId NULL.';
    END IF;
END $$;

-- Menghapus relasi lama pada tabel Review
ALTER TABLE "Review"
DROP CONSTRAINT "Review_kulinerId_fkey";

ALTER TABLE "Review"
DROP CONSTRAINT "Review_userId_fkey";

-- Menghapus index dan kolom lama pada tabel Review
DROP INDEX "Review_kulinerId_idx";

ALTER TABLE "Review"
DROP COLUMN "namaUser";

ALTER TABLE "Review"
DROP COLUMN "kulinerId";

-- Menyesuaikan kolom Review dengan schema terbaru
ALTER TABLE "Review"
ALTER COLUMN "userId" SET NOT NULL;

ALTER TABLE "Review"
ALTER COLUMN "status" SET DEFAULT 'AKTIF';

-- Menambahkan index createdAt
CREATE INDEX "Review_createdAt_idx"
ON "Review"("createdAt");

-- Membuat relasi baru antara Review dan User
ALTER TABLE "Review"
ADD CONSTRAINT "Review_userId_fkey"
FOREIGN KEY ("userId")
REFERENCES "User"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;