import { Router } from "express";
import { register, login, getProfile } from "../controllers/userController.js";
import { auth } from '../middleware/auth.js';

const userRoutes = Router();

userRoutes.post("/register", register);
userRoutes.post("/login", login);
userRoutes.get("/profile", auth, getProfile);

export default userRoutes;
