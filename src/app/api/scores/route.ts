import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma.config";
import { Game } from "@prisma/client";
import { getUserIdFromRequest } from "@/app/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized: userId missing" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { game, score } = body;

    if (!game || score === undefined) {
      return NextResponse.json(
        { error: "Game and score are required" },
        { status: 400 }
      );
    }

    const parsedScore = parseInt(score);
    if (isNaN(parsedScore) || parsedScore < 0) {
      return NextResponse.json(
        { error: "Score must be a positive integer" },
        { status: 400 }
      );
    }

    if (!Object.values(Game).includes(game)) {
      return NextResponse.json({ error: "Invalid game type" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Define start and end of today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const existingScore = await prisma.score.findFirst({
      where: {
        userId,
        game,
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    let newScore;

    if (!existingScore) {
      newScore = await prisma.score.create({
        data: {
          userId,
          game,
          score: parsedScore,
          times: 1,
        },
      });
    } else {
      newScore = await prisma.score.update({
        where: { id: existingScore.id },
        data: {
          score:
            parsedScore > existingScore.score
              ? parsedScore
              : existingScore.score,
          times: { increment: 1 },
        },
      });
    }

    return NextResponse.json(
      {
        message: "Score saved successfully",
        data: newScore,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating/updating score:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
