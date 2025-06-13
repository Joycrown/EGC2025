/*
  Warnings:

  - You are about to drop the column `date` on the `Attendance` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId]` on the table `Attendance` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `Attendance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userEmail` to the `Attendance` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'MINISTER';

-- DropIndex
DROP INDEX "Attendance_userId_date_key";

-- AlterTable
ALTER TABLE "Attendance" DROP COLUMN "date",
ADD COLUMN     "day_11_july" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "day_12_july" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "day_13_july" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "userEmail" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Attendance_userId_key" ON "Attendance"("userId");
