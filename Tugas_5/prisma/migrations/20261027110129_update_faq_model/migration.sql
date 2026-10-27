/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `FAQ` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `FAQ` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FAQ" ADD COLUMN     "iconClass" TEXT NOT NULL DEFAULT 'bx bx-info-circle',
ADD COLUMN     "slug" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "FAQ_slug_key" ON "FAQ"("slug");
