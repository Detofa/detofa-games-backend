import jwt from "jsonwebtoken";
import { JWT_SECRET } from "./authConfig";

export const getUserIdFromToken = (token) => {
  if (!token) {
    throw new Error("Unauthorized: No token provided");
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded.userId) {
      throw new Error("Unauthorized: Token does not contain a user ID");
    }
    return decoded.userId; // Return only the user ID
  } catch (error) {
    throw new Error("Unauthorized: Invalid token");
  }
};
