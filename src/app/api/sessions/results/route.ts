import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma.config";

export async function POST(req: NextRequest) {
  try {
    const { sessionId } = await req.json();
    if (!sessionId) {
      return NextResponse.json(
        { error: "sessionId is required" },
        { status: 400 }
      );
    }
    const players = await prisma.mathAdditionSessionPlayer.findMany({
      where: { sessionId },
      include: { user: { select: { name: true } } },
    });
    const guesses = await prisma.mathAdditionGuess.findMany({
      where: { sessionId },
      orderBy: { submittedAt: "desc" },
    });
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
        name: p.user?.name ?? null,
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
