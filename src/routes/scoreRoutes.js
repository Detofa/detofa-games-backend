import { Router } from "express";
import { createScore } from "./../controllers/scoreController.js";
import { getScores } from "./../controllers/getScoreController.js";

const scoreRouter = Router();

scoreRouter.post("/", createScore);
scoreRouter.get("/:game", getScores);

export default scoreRouter;
