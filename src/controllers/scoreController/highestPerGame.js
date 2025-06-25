import { PrismaClient } from "@prisma/client";
import { startOfDay, startOfWeek, startOfMonth, startOfYear } from "date-fns";

const prisma = new PrismaClient();

export const highestScoresPerGame = async (req, res) => {
  const userId = req.userId;
  const { filter } = req.body;

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized: userId missing" });
  }

  let startDate;
  const now = new Date();

  switch (filter?.toLowerCase()) {
    case "day":
      startDate = startOfDay(now);
      break;
    case "week":
      startDate = startOfWeek(now, { weekStartsOn: 1 }); // Monday
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

  try {
    // Fetch all scores for this user, optionally filtered by date
    const scores = await prisma.score.findMany({
      where: {
        userId,
        ...(startDate ? { createdAt: { gte: startDate } } : {}),
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Highest score per game logic
    const bestScoresByGame = {};

    for (const score of scores) {
      const game = score.game;
      if (!bestScoresByGame[game] || score.score > bestScoresByGame[game].score) {
        bestScoresByGame[game] = score;
      }
    }

    const result = Object.entries(bestScoresByGame).map(([game, data]) => ({
      game,
      score: data.score,
      date: data.createdAt,
    }));

    res.json(result);
  } catch (error) {
    console.error("Error in /scores/user/highest-per-game:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
