-- AlterTable
ALTER TABLE "Image" ADD COLUMN     "reviewId" TEXT;

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Review"("id") ON DELETE SET NULL ON UPDATE CASCADE;
