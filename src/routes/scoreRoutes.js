import { Router } from "express";
import { createScore } from "./../controllers/scoreController.js";

const scoreRouter = Router();

scoreRouter.post("/", createScore);

export default scoreRouter;
