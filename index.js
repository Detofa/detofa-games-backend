import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import {
  initializePassport,
  authenticateGoogle,
  googleCallback,
} from "./src/auth/googleAuth.js";

dotenv.config();

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

// Initialize passport middleware
app.use(initializePassport());

// Google OAuth routes
app.get("/auth/google", authenticateGoogle);

app.get("/auth/google/callback", googleCallback);

// Health check endpoint
app.use("/", (req, res) => {
  res.send("Hello from the backend 2!");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
