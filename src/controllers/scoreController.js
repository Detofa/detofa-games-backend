import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

export const createScore = async (req, res) => {
  try {
    const { game, score } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: req.userId },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!game || score === undefined) {
      return res.status(400).json({ error: "Game and score are required" });
    }

    const parsedScore = parseInt(score);
    if (isNaN(parsedScore) || parsedScore < 0) {
      return res
        .status(400)
        .json({ error: "Score must be a positive integer" });
    }

    // Get start and end of today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const existingScore = await prisma.score.findFirst({
      where: {
        userId: req.userId,
        game,
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    let newScore;

    if (!existingScore) {
      // No score yet for today
      newScore = await prisma.score.create({
        data: {
          userId: req.userId,
          game,
          score: parsedScore,
          times: 1,
        },
      });
    } else {
      // Score exists → Update only if new score is higher
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

    res
      .status(201)
      .json({ message: "Score saved successfully", data: newScore });
  } catch (error) {
    console.error("Error creating/updating score:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
