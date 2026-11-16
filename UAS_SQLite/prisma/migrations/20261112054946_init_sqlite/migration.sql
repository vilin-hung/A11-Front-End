-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nama" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "kota" TEXT,
    "avatar" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Kuliner" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nama" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "sejarah" TEXT NOT NULL DEFAULT '',
    "kategori" TEXT NOT NULL,
    "daerah" TEXT NOT NULL,
    "bahan" TEXT NOT NULL DEFAULT '[]',
    "rasa" TEXT NOT NULL DEFAULT '[]',
    "gambar" TEXT,
    "hargaMin" INTEGER NOT NULL,
    "hargaMax" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "catatanAdmin" TEXT,
    "submittedBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Kuliner_submittedBy_fkey" FOREIGN KEY ("submittedBy") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Favorite" (
    "userId" TEXT NOT NULL,
    "kulinerId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("userId", "kulinerId"),
    CONSTRAINT "Favorite_kulinerId_fkey" FOREIGN KEY ("kulinerId") REFERENCES "Kuliner" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Favorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "komentar" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'AKTIF',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FAQ" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pertanyaan" TEXT NOT NULL,
    "jawaban" TEXT NOT NULL,
    "urutan" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "iconClass" TEXT NOT NULL DEFAULT 'bx bx-info-circle',
    "slug" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "SiteMetadata" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "MapRegion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nama" TEXT NOT NULL,
    "daerah" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "posisiX" REAL NOT NULL DEFAULT 50,
    "posisiY" REAL NOT NULL DEFAULT 50,
    "isActive" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "ContactMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "subjek" TEXT NOT NULL,
    "pesan" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'BARU',
    "isFaqReference" BOOLEAN NOT NULL DEFAULT false,
    "faqId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ContactMessage_faqId_fkey" FOREIGN KEY ("faqId") REFERENCES "FAQ" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Kuliner_status_idx" ON "Kuliner"("status");

-- CreateIndex
CREATE INDEX "Kuliner_kategori_idx" ON "Kuliner"("kategori");

-- CreateIndex
CREATE INDEX "Kuliner_daerah_idx" ON "Kuliner"("daerah");

-- CreateIndex
CREATE INDEX "Favorite_kulinerId_idx" ON "Favorite"("kulinerId");

-- CreateIndex
CREATE INDEX "Review_status_idx" ON "Review"("status");

-- CreateIndex
CREATE INDEX "Review_createdAt_idx" ON "Review"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "FAQ_slug_key" ON "FAQ"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "SiteMetadata_key_key" ON "SiteMetadata"("key");

-- CreateIndex
CREATE UNIQUE INDEX "MapRegion_daerah_key" ON "MapRegion"("daerah");

-- CreateIndex
CREATE INDEX "ContactMessage_status_idx" ON "ContactMessage"("status");

-- CreateIndex
CREATE INDEX "ContactMessage_createdAt_idx" ON "ContactMessage"("createdAt");

-- CreateIndex
CREATE INDEX "ContactMessage_faqId_idx" ON "ContactMessage"("faqId");

-- CreateIndex
CREATE INDEX "ContactMessage_isFaqReference_idx" ON "ContactMessage"("isFaqReference");
