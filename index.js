import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import { PrismaClient } from "@prisma/client";
import userRoutes from "./src/routes/userRoutes.js";
import scoreRouter from "./src/routes/scoreRoutes.js";
import videoRoutes from "./src/routes/videoRoutes.js";

dotenv.config();

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: "*",
    methods: "GET,POST,DELETE,PUT",
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(bodyParser.json());
app.use(express.json());
app.use("/api/users", userRoutes);
app.use("/api/scores", scoreRouter);
app.use("/api/videos", videoRoutes);
app.use("/", (req, res) => {
  res.send("Hello from the backend 2!");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
