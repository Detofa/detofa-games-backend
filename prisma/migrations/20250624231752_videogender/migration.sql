/*
  Warnings:

  - The `gender` column on the `Video` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Video" DROP COLUMN "gender",
ADD COLUMN     "gender" "VideoGender";
