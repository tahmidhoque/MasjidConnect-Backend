/*
  Warnings:

  - The values [HADITH] on the enum `ContentType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `playlistId` on the `Screen` table. All the data in the column will be lost.
  - You are about to drop the `Playlist` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PlaylistItem` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ContentType_new" AS ENUM ('VERSE_HADITH', 'ANNOUNCEMENT', 'EVENT', 'CUSTOM');
ALTER TABLE "ContentItem" ALTER COLUMN "type" TYPE "ContentType_new" USING ("type"::text::"ContentType_new");
ALTER TYPE "ContentType" RENAME TO "ContentType_old";
ALTER TYPE "ContentType_new" RENAME TO "ContentType";
DROP TYPE "ContentType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "Playlist" DROP CONSTRAINT "Playlist_masjidId_fkey";

-- DropForeignKey
ALTER TABLE "PlaylistItem" DROP CONSTRAINT "PlaylistItem_contentItemId_fkey";

-- DropForeignKey
ALTER TABLE "PlaylistItem" DROP CONSTRAINT "PlaylistItem_playlistId_fkey";

-- DropForeignKey
ALTER TABLE "Screen" DROP CONSTRAINT "Screen_playlistId_fkey";

-- AlterTable
ALTER TABLE "Screen" DROP COLUMN "playlistId",
ADD COLUMN     "scheduleId" TEXT;

-- DropTable
DROP TABLE "Playlist";

-- DropTable
DROP TABLE "PlaylistItem";

-- CreateTable
CREATE TABLE "ContentSchedule" (
    "id" TEXT NOT NULL,
    "masjidId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContentSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentScheduleItem" (
    "id" TEXT NOT NULL,
    "scheduleId" TEXT NOT NULL,
    "contentItemId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContentScheduleItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ContentSchedule_masjidId_isDefault_key" ON "ContentSchedule"("masjidId", "isDefault");

-- CreateIndex
CREATE UNIQUE INDEX "ContentScheduleItem_scheduleId_order_key" ON "ContentScheduleItem"("scheduleId", "order");

-- AddForeignKey
ALTER TABLE "Screen" ADD CONSTRAINT "Screen_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "ContentSchedule"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentSchedule" ADD CONSTRAINT "ContentSchedule_masjidId_fkey" FOREIGN KEY ("masjidId") REFERENCES "Masjid"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentScheduleItem" ADD CONSTRAINT "ContentScheduleItem_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "ContentSchedule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentScheduleItem" ADD CONSTRAINT "ContentScheduleItem_contentItemId_fkey" FOREIGN KEY ("contentItemId") REFERENCES "ContentItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
