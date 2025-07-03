import pkg from "@prisma/client";
const { PrismaClient } = pkg;
import { getUserIdFromToken } from "./../utils/authUtils.js"; // Import the updated utility

const prisma = new PrismaClient();

export const getScores = async (req, res) => {
  try {
    const { game } = req.params;

    const token = req.headers.authorization?.split(" ")[1]; // Get token from Authorization header

    const gameTable = ["SNAKE", " FLAPPY_BIRD", "TETRIS"];
    if (!gameTable.includes(game)) {
      return res.status(400).json({ error: "Invalid game type" });
    }

    // Verify the token and extract the user ID
    const userId = getUserIdFromToken(token);

    console.log("userId", userId);

    // Fetch scores for the specified game and user
    const scores = await prisma.score.findMany({
      where: { game, userId }, // Filter by both game and userId
      include: { user: true }, // Include user details if needed
      orderBy: { score: "desc" }, // Order by score in descending order
    });

    res.status(200).json({ data: scores });
  } catch (error) {
    console.error("Error fetching scores:", error);
    if (error.message.startsWith("Unauthorized:")) {
      return res.status(401).json({ error: error.message });
    }
    res.status(500).json({ error: "Internal server error" });
  }
};
