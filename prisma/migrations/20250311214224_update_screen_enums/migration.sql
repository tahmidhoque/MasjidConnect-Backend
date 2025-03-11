/*
  Warnings:

  - The `status` column on the `Screen` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `orientation` column on the `Screen` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Screen" DROP COLUMN "status",
ADD COLUMN     "status" "ScreenStatus" NOT NULL DEFAULT 'OFFLINE',
DROP COLUMN "orientation",
ADD COLUMN     "orientation" "ScreenOrientation" NOT NULL DEFAULT 'LANDSCAPE';

-- CreateIndex
CREATE INDEX "Screen_status_idx" ON "Screen"("status");
