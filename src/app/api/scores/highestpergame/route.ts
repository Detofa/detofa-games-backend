import { NextRequest, NextResponse } from "next/server";
import { Game } from "@prisma/client";
import prisma from "@/app/lib/prisma.config";
import { getUserIdFromRequest } from "@/app/lib/auth";
import { startOfDay, startOfWeek, startOfMonth, startOfYear } from "date-fns";

interface HighestScoreRequestBody {
  filter?: "day" | "week" | "month" | "year";
}

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
    const { filter }: HighestScoreRequestBody = body;

    let startDate: Date | null = null;
    const now = new Date();

    switch (filter?.toLowerCase()) {
      case "day":
        startDate = startOfDay(now);
        break;
      case "week":
        startDate = startOfWeek(now, { weekStartsOn: 1 });
        break;
      case "month":
        startDate = startOfMonth(now);
        break;
      case "year":
        startDate = startOfYear(now);
        break;
      default:
        startDate = null;
    }

    const scores = await prisma.score.findMany({
      where: {
        userId,
        ...(startDate ? { createdAt: { gte: startDate } } : {}),
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Keep highest score per game
    const bestScoresByGame: Record<Game, (typeof scores)[0]> = {} as any;

    for (const score of scores) {
      const game = score.game;
      if (
        !bestScoresByGame[game] ||
        score.score > bestScoresByGame[game].score
      ) {
        bestScoresByGame[game] = score;
      }
    }

    const result = Object.entries(bestScoresByGame).map(([game, data]) => ({
      game,
      score: data.score,
    }));

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Error in /scores/user/highest-per-game:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
