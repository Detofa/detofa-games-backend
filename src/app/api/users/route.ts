import { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import { Gender } from "@prisma/client";
import prisma from "../utils/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") return res.status(405).end();

  const { name, email, phone, password, city, gender, parent } = req.body;

  try {
    const errors = [];
    if (!name) errors.push("Name is required");
    if (!email) errors.push("Email is required");
    if (!phone) errors.push("Phone number is required");
    if (!password) errors.push("Password is required");
    if (!city) errors.push("City is required");
    if (!gender) errors.push("Gender is required");

    if (errors.length > 0) return res.status(400).json({ errors });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email))
      return res.status(400).json({ error: "Invalid email format" });

    const existingUser = await prisma.user.findUnique({ where: { phone } });
    if (existingUser)
      return res.status(400).json({ error: "Phone number already registered" });

    if (parent) {
      const parentUser = await prisma.user.findUnique({
        where: { phone: parent },
      });
      if (!parentUser)
        return res.status(400).json({ error: "Parent phone number not found" });
    }

    const prismaGender = ["Homme", "homme", "Male", "male"].includes(gender)
      ? "MALE"
      : ["Femme", "femme", "Female", "female"].includes(gender)
      ? "FEMALE"
      : null;

    if (!prismaGender)
      return res.status(400).json({ error: "Invalid gender value" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        phone,
        email,
        password: hashedPassword,
        city,
        gender: prismaGender === "MALE" ? Gender.MALE : Gender.FEMALE,
        ...(parent && { parent }),
      },
    });

    res.status(201).json({ message: "User registered successfully", user });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
