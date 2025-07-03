import { Router } from "express";
import {
  transferFunds,
  getTransactionHistory,
} from "../controllers/transactionController.js";
import { auth } from "../middleware/auth.js";

const transactionRoutes = Router();

// Transfer funds between users (requires authentication)
transactionRoutes.post("/transfer", auth, transferFunds);

// Get transaction history for authenticated user
transactionRoutes.get("/history", auth, getTransactionHistory);

export default transactionRoutes;
