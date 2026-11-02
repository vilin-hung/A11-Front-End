-- Add sejarah column to Kuliner
ALTER TABLE "Kuliner"
ADD COLUMN "sejarah" TEXT NOT NULL DEFAULT '';

-- Remove MapPin table and its foreign key
DROP TABLE IF EXISTS "MapPin";

-- Create MapRegion table
CREATE TABLE "MapRegion" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "daerah" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "posisiX" DOUBLE PRECISION NOT NULL DEFAULT 50,
    "posisiY" DOUBLE PRECISION NOT NULL DEFAULT 50,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "MapRegion_pkey" PRIMARY KEY ("id")
);

-- Add unique index
CREATE UNIQUE INDEX "MapRegion_daerah_key"
ON "MapRegion"("daerah");