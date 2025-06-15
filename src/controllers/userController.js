import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
import { Gender } from "@prisma/client";
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function register(req, res) {
  const { name, email, phone, password, city, gender, parent } = req.body;

  try {
    // Validate required fields
    const errors = [];
    if (!name) errors.push("Name is required");
    if (!email) errors.push("Email is required");
    if (!phone) errors.push("Phone number is required");
    if (!password) errors.push("Password is required");
    if (!city) errors.push("City is required");
    if (!gender) errors.push("Gender is required");

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // Check if user with phone number already exists
    const existingUser = await prisma.user.findUnique({
      where: { phone },
    });

    if (existingUser) {
      return res.status(400).json({ error: "Phone number already registered" });
    }

    // Validate parent phone if provided
    if (parent) {
      const parentUser = await prisma.user.findUnique({
        where: { phone: parent },
      });

      if (!parentUser) {
        return res.status(400).json({ error: "Parent phone number not found" });
      }
    }

    const prismaGender =
      gender === "Homme" ||
      gender === "Male" ||
      gender === "homme" ||
      gender === "male"
        ? "MALE"
        : gender === "Femme" ||
          gender === "Female" ||
          gender === "female" ||
          gender === "femme"
        ? "FEMALE"
        : null;

    if (!prismaGender) {
      return res
        .status(400)
        .json({ error: "Invalid gender value, try again please" });
    }
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
          parent: parent || undefined,
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
    if (!phone || !password) {
      return res.status(400).json({ error: "Phone and password are required" });
    }

    const user = await prisma.user.findUnique({ where: { phone } });

    console.log("user", user);

    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const isMatch = bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: "7200h",
    });

    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function getProfile(req, res) {
  console.log("req.userId", req.userId);
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const {
      id,
      status,
      country,
      imageUrl,
      password,
      createdAt,
      updatedAt,
      ...safeUser
    } = user;
    res.status(200).json(safeUser);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
}
