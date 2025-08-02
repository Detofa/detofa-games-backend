import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma.config";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const sessionId = params.id;
  if (!sessionId) {
    return NextResponse.json(
      { error: "Session ID is required" },
      { status: 400 }
    );
  }
  try {
    // Get all players
    const players = await prisma.mathAdditionSessionPlayer.findMany({
      where: { sessionId },
      include: { user: { select: { username: true } } },
    });
    // Get latest guesses for this session
    const guesses = await prisma.mathAdditionGuess.findMany({
      where: { sessionId },
      orderBy: { submittedAt: "desc" },
    });
    // Map playerId to latest guess
    const latestGuessByUser = new Map();
    for (const guess of guesses) {
      if (!latestGuessByUser.has(guess.userId)) {
        latestGuessByUser.set(guess.userId, guess);
      }
    }
    const results = players.map((p) => {
      const guess = latestGuessByUser.get(p.userId);
      return {
        userId: p.userId,
        username: p.user?.username ?? null,
        guess: guess?.guessValue ?? null,
        distance: guess?.distanceFromCorrectAnswer ?? null,
        eliminated: p.eliminated,
        ranking: p.ranking,
      };
    });
    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error("Error fetching results:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
