import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
import { Gender } from "@prisma/client";
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function register(req, res) {
  const { name, email, phone, password, city, gender } = req.body;
  console.log("Request Body", req.body);

  try {
    const prismaGender =
      gender === "Homme" || gender === "Male"
        ? "MALE"
        : gender === "Femme" || gender === "Female"
        ? "FEMALE"
        : null;

    if (!prismaGender) {
      return res
        .status(400)
        .json({ error: "Invalid gender value, try again please" });
    }
    console.log("Prisma Gender", prismaGender);
    const hashedPassword = await bcrypt.hash(password, 10);

    if (prismaGender === "MALE") {
      const user = await prisma.user.create({
        data: {
          name,
          phone,
          email,
          password: hashedPassword,
          city,
          gender: Gender.MALE,
        },
      });
      res.status(201).json({ message: "User registered successfully", user });
    }

    if (prismaGender === "FEMALE") {
      const user = await prisma.user.create({
        data: {
          name,
          phone,
          email,
          password: hashedPassword,
          city,
          gender: Gender.FEMALE,
        },
      });
      res.status(201).json({ message: "User registered successfully", user });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

export async function login(req, res) {
  const { phone, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: "1h",
    });
    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}
