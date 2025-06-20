import { Game, PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key"; // Ensure this is securely stored

export const createScore = async (req, res) => {
  try {
    const { game, score } = req.body;

    // // Ensure token is provided
    // if (!userId) {
    //   return res.status(401).json({ error: "Unauthorized: No token provided" });
    // }

    // // Verify and decode the token
    // let decoded = "";
    // try {
    //   decoded = jwt.verify(userId, JWT_SECRET);
    // } catch (error) {
    //   return res.status(401).json({ error: "Unauthorized: Invalid token" });
    // }

    // const theuserId = decoded.userId; // Extract user ID from the decoded token
    // console.log("theuserId here", theuserId);

    const user = await prisma.user.findUnique({
      where: { id: req.userId },
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

    // Check if the user has existing score for the game
    const existingScore = await prisma.score.findFirst({
      where: { userId: theuserId, game },
    });

    let newScore;

    if (!existingScore) {
      // No score exists → Create new score
      newScore = await prisma.score.create({
        data: {
          userId: theuserId,
          game,
          score: parseInt(score),
          times: 1,
        },
      });
    } else {
      // Score exists → Update with new score and increment times
      newScore = await prisma.score.update({
        where: { id: existingScore.id },
        data: {
          score: parseInt(score),
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
