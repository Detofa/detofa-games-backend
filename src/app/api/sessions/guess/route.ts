import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma.config";

export async function POST(req: NextRequest) {
  try {
    const { sessionId, userId, guessValue } = await req.json();
    if (!sessionId || !userId || typeof guessValue !== "number") {
      return NextResponse.json(
        { error: "sessionId, userId, and guessValue are required" },
        { status: 400 }
      );
    }
    const numbers = await prisma.mathAdditionSessionNumber.findMany({
      where: { sessionId },
    });
    const correctSum = numbers.reduce((acc, n) => acc + n.value, 0);
    const distance = Math.abs(guessValue - correctSum);
    const isCorrect = guessValue === correctSum;
    const guess = await prisma.mathAdditionGuess.create({
      data: {
        sessionId,
        userId,
        guessValue,
        isCorrect,
        distanceFromCorrectAnswer: distance,
      },
    });
    return NextResponse.json({ guess, correctSum }, { status: 201 });
  } catch (error) {
    console.error("Error submitting guess:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
