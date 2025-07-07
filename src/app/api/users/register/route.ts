import { NextRequest, NextResponse } from "next/server";
import pkg from "@prisma/client";
import bcrypt from "bcryptjs";
import prisma from "../../utils/prisma.js";

const { Gender } = pkg;

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, password, city, gender, parent } =
      await request.json();

    // Validate required fields
    const errors = [];
    if (!name) errors.push("Name is required");
    if (!email) errors.push("Email is required");
    if (!phone) errors.push("Phone number is required");
    if (!password) errors.push("Password is required");
    if (!city) errors.push("City is required");
    if (!gender) errors.push("Gender is required");

    if (errors.length > 0) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Check if user with phone number already exists
    const existingUser = await prisma.user.findUnique({
      where: { phone },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Phone number already registered" },
        { status: 400 }
      );
    }

    // Validate parent phone if provided
    if (parent) {
      const parentUser = await prisma.user.findUnique({
        where: { phone: parent },
      });

      if (!parentUser) {
        return NextResponse.json(
          { error: "Parent phone number not found" },
          { status: 400 }
        );
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
      return NextResponse.json(
        { error: "Invalid gender value, try again please" },
        { status: 400 }
      );
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
      return NextResponse.json(
        { message: "User registered successfully", user },
        { status: 201 }
      );
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

      return NextResponse.json(
        { message: "User registered successfully", user },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Registration failed" },
      { status: 400 }
    );
  }
}
