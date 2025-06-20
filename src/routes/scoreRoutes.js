import { Router } from "express";
import { createScore } from "./../controllers/scoreController.js";
import { getScores } from "./../controllers/getScoreController.js";
import { auth } from "./../middleware/auth.js";

const scoreRouter = Router();

scoreRouter.get("/:game", getScores);
scoreRouter.post("/", auth, createScore);

export default scoreRouter;
