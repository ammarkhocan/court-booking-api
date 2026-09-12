/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Court` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `Court` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `Court` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Court" ADD COLUMN     "slug" TEXT NOT NULL,
ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE UNIQUE INDEX "Court_name_key" ON "Court"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Court_slug_key" ON "Court"("slug");
