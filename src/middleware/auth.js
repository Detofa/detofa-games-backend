import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export const auth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ error: "Authorization header missing or invalid" });
  }

  const token = authHeader.split(" ")[1];
  console.log("Incoming token:", token);
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("Incoming decoded:", decoded);
    console.log("Incoming decoded.userId:", decoded.userId);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    console.error("JWT verification failed:", error);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};
