import { Router } from "express";
import { createScore } from "../controllers/scoreController/scoreController.js";
import { getScores } from "./../controllers/getScoreController.js";
import { auth } from "./../middleware/auth.js";
import { getHighestScorePerGame } from "../controllers/scoreController/highestPerGame.js";
import { getTopScores } from "../controllers/scoreController/topScores.js";

const scoreRouter = Router();

scoreRouter.get("/:game", getScores);
scoreRouter.post("/", auth, createScore);
scoreRouter.post("/top", auth, getTopScores);
scoreRouter.post("/highestpergame", auth, getHighestScorePerGame);

export default scoreRouter;
