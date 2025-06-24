/*
  Warnings:

  - You are about to drop the column `type` on the `Score` table. All the data in the column will be lost.
  - Added the required column `times` to the `Score` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Score_userId_game_type_createdAt_idx";

-- AlterTable
ALTER TABLE "Score" DROP COLUMN "type",
ADD COLUMN     "times" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "Score_userId_game_times_createdAt_idx" ON "Score"("userId", "game", "times", "createdAt");
