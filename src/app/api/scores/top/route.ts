import { NextRequest, NextResponse } from "next/server";
import { Prisma, Game } from "@prisma/client";
import prisma from "@/app/lib/prisma.config";
import { startOfDay, startOfWeek, startOfMonth, startOfYear } from "date-fns";
import { getUserIdFromRequest } from "@/app/lib/auth";

// ✅ Define an "include" shape
const scoreInclude = Prisma.validator<Prisma.ScoreInclude>()({
  user: {
    select: {
      id: true,
      name: true,
    },
  },
});

// ✅ Derive the return type from that include
type ScoreWithUser = Prisma.ScoreGetPayload<{
  include: typeof scoreInclude;
}>;

export async function POST(req: NextRequest) {
  try {
    const currentUserId = getUserIdFromRequest(req);
    if (!currentUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      gameName,
      filter,
    }: { gameName: Game; filter?: "Day" | "Week" | "Month" | "Year" } = body;

    if (!gameName) {
      return NextResponse.json(
        { error: "gameName is required in the request body" },
        { status: 400 }
      );
    }

    let startDate: Date | null = null;
    const now = new Date();

    switch (filter) {
      case "Day":
        startDate = startOfDay(now);
        break;
      case "Week":
        startDate = startOfWeek(now, { weekStartsOn: 1 });
        break;
      case "Month":
        startDate = startOfMonth(now);
        break;
      case "Year":
        startDate = startOfYear(now);
        break;
      default:
        startDate = null;
    }

    const allScores: ScoreWithUser[] = await prisma.score.findMany({
      where: {
        game: gameName,
        ...(startDate ? { createdAt: { gte: startDate } } : {}),
      },
      include: scoreInclude,
    });

    // Reduce to keep best score per user
    const bestPerUser = Object.values(
      allScores.reduce((acc, score) => {
        const userId = score.user.id;
        if (!acc[userId] || score.score > acc[userId].score) {
          acc[userId] = score;
        }
        return acc;
      }, {} as Record<string, ScoreWithUser>)
    );

    const top10 = bestPerUser.sort((a, b) => b.score - a.score).slice(0, 10);

    const formatted = top10.map((entry) => {
      const isCurrentUser = entry.user.id === currentUserId;
      return {
        user: isCurrentUser ? entry.user.name : entry.user.id.substring(0, 5),
        score: entry.score,
      };
    });

    return NextResponse.json(formatted, { status: 200 });
  } catch (error) {
    console.error("Error in /scores/top:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
