/*
  Warnings:

  - Added the required column `perImage` to the `Place` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Place" ADD COLUMN     "perImage" TEXT NOT NULL;
