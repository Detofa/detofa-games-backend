-- AlterTable
ALTER TABLE "App" ADD COLUMN     "completedSteps" JSONB,
ADD COLUMN     "isComplete" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "fileUrl" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "App_isComplete_idx" ON "App"("isComplete");
