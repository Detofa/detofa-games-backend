import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";

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

// Health check endpoint
app.use("/", (req, res) => {
  res.send("Hello from the backend 2!");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
