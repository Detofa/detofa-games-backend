import { Router } from "express";
import { createScore } from "../controllers/scoreController/scoreController.js";
import { getScores } from "./../controllers/getScoreController.js";
import { auth } from "./../middleware/auth.js";
import { highestScoresPerGame } from "../controllers/scoreController/highestPerGame.js";
import { topScores } from "../controllers/scoreController/topScores.js";

const scoreRouter = Router();

scoreRouter.get("/:game", getScores);
scoreRouter.post("/", auth, createScore);
scoreRouter.post("/top", auth, topScores);
scoreRouter.post("/highestpergame", auth, highestScoresPerGame);

export default scoreRouter;
