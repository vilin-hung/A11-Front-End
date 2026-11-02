-- AlterTable
ALTER TABLE "ContactMessage" ADD COLUMN     "isFaqReference" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "ContactMessage_isFaqReference_idx" ON "ContactMessage"("isFaqReference");
