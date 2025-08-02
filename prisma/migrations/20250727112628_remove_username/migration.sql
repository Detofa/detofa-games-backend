-- CreateEnum
CREATE TYPE "GameMode" AS ENUM ('SOLO', 'GROUP');

-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('WAITING', 'PLAYING', 'ENDED');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "totalScore" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "MathAdditionSession" (
    "id" TEXT NOT NULL,
    "hostUserId" TEXT NOT NULL,
    "gameMode" "GameMode" NOT NULL,
    "numberCount" INTEGER NOT NULL DEFAULT 10,
    "status" "SessionStatus" NOT NULL DEFAULT 'WAITING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,

    CONSTRAINT "MathAdditionSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MathAdditionSessionPlayer" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isHost" BOOLEAN NOT NULL DEFAULT false,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "eliminated" BOOLEAN NOT NULL DEFAULT false,
    "ranking" INTEGER,

    CONSTRAINT "MathAdditionSessionPlayer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MathAdditionSessionNumber" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "index" INTEGER NOT NULL,
    "value" INTEGER NOT NULL,

    CONSTRAINT "MathAdditionSessionNumber_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MathAdditionGuess" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "guessValue" INTEGER NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "distanceFromCorrectAnswer" INTEGER NOT NULL,

    CONSTRAINT "MathAdditionGuess_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MathAdditionSession" ADD CONSTRAINT "MathAdditionSession_hostUserId_fkey" FOREIGN KEY ("hostUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MathAdditionSession" ADD CONSTRAINT "MathAdditionSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MathAdditionSessionPlayer" ADD CONSTRAINT "MathAdditionSessionPlayer_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "MathAdditionSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MathAdditionSessionPlayer" ADD CONSTRAINT "MathAdditionSessionPlayer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MathAdditionSessionNumber" ADD CONSTRAINT "MathAdditionSessionNumber_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "MathAdditionSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MathAdditionGuess" ADD CONSTRAINT "MathAdditionGuess_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "MathAdditionSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MathAdditionGuess" ADD CONSTRAINT "MathAdditionGuess_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
