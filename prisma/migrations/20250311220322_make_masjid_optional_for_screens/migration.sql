-- DropForeignKey
ALTER TABLE "Screen" DROP CONSTRAINT "Screen_masjidId_fkey";

-- AlterTable
ALTER TABLE "Screen" ALTER COLUMN "masjidId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Screen" ADD CONSTRAINT "Screen_masjidId_fkey" FOREIGN KEY ("masjidId") REFERENCES "Masjid"("id") ON DELETE SET NULL ON UPDATE CASCADE;
