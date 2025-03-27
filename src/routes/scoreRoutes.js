import { Router } from "express";
import { createScore } from "./../controllers/scoreController.js";
import { getScores } from "./../controllers/getScoreController.js";

const scoreRouter = Router();

scoreRouter.get("/:game", getScores);
scoreRouter.post("/", createScore);

export default scoreRouter;
