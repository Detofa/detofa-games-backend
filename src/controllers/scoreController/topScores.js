import { PrismaClient } from "@prisma/client";
import { startOfDay, startOfWeek, startOfMonth, startOfYear } from "date-fns";

const prisma = new PrismaClient();

export const topScores = async (req, res) => {
  const { gameName, filter } = req.body;
  const currentUserId = req.userId;

  if (!gameName) {
    return res
      .status(400)
      .json({ error: "game name is required in the request body" });
  }

  // Determine filter range
  let startDate;
  const now = new Date();

  switch (filter) {
    case "Day":
      startDate = startOfDay(now);
      break;
    case "Week":
      startDate = startOfWeek(now, { weekStartsOn: 1 }); // Monday
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

  try {
    const allScores = await prisma.score.findMany({
      where: {
        game: gameName,
        ...(startDate ? { createdAt: { gte: startDate } } : {}),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Keep best score per user
    const bestPerUser = Object.values(
      allScores.reduce((acc, score) => {
        const existing = acc[score.user.id];
        if (!existing || score.score > existing.score) {
          acc[score.user.id] = score;
        }
        return acc;
      }, {})
    );

    // Sort by score descending and take top 10
    const top10 = bestPerUser.sort((a, b) => b.score - a.score).slice(0, 10);

    const formatted = top10.map((entry) => {
      const isCurrentUser = entry.user.id === currentUserId;
      return {
        user: isCurrentUser ? entry.user.name : entry.user.id.substring(0, 5),
        score: entry.score,
      };
    });

    res.json(formatted);
  } catch (error) {
    console.error("Error in /scores/top:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
