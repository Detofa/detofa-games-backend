import { Game, PrismaClient, ScoreType } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key"; // Ensure this is securely stored

export const createScore = async (req, res) => {
  try {
    const { userId, game, score } = req.body;

    // Ensure token is provided
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    // Verify and decode the token
    let decoded = "";
    try {
      decoded = jwt.verify(userId, JWT_SECRET);
    } catch (error) {
      return res.status(401).json({ error: "Unauthorized: Invalid token" });
    }

    const theuserId = decoded.userId; // Extract user ID from the decoded token
    console.log("theuserId", theuserId);

    const user = await prisma.user.findUnique({
      where: { id: theuserId },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Validate required fields
    if (!game || score === undefined) {
      return res.status(400).json({ error: "Game and score are required" });
    }

    // Ensure score is a positive integer
    if (typeof parseInt(score) != "number" || parseInt(score) < 0) {
      return res
        .status(400)
        .json({ error: "Score must be a positive integer" });
    }

    // Check if the user has existing scores for the game
    const existingScores = await prisma.score.findMany({
      where: { userId: theuserId, game },
    });

    let newScores;

    if (existingScores.length === 0) {
      // No scores exist → Create ALL score types
      newScores = await prisma.score.createMany({
        data: Object.values(ScoreType).map((type) => ({
          userId: theuserId,
          game,
          score: parseInt(score),
          type,
        })),
      });
    } else {
      // Scores exist → Update each type with the new score if it's greater than the existing score
      const updatePromises = existingScores.map((existingScore) => {
        if (existingScore.type === "DAILY") {
          const today = new Date().toISOString().split("T")[0];
          if (
            existingScore.updatedAt.toISOString().split("T")[0] !== today ||
            parseInt(score) > existingScore.score
          ) {
            return prisma.score.update({
              where: { id: existingScore.id },
              data: { score: parseInt(score) },
            });
          }
        } else if (parseInt(score) > existingScore.score) {
          return prisma.score.update({
            where: { id: existingScore.id },
            data: { score: parseInt(score) },
          });
        } else {
          return Promise.resolve(existingScore); // Return the existing score without updating
        }
      });

      newScores = await Promise.all(updatePromises);
    }

    res
      .status(201)
      .json({ message: "Score(s) saved successfully", data: newScores });
  } catch (error) {
    console.error("Error creating/updating score:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
