import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "../../utils/prisma.js";

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, password, parent } = await request.json();

    // Validation des champs obligatoires
    const errors = [];
    if (!name) errors.push("Name is required");
    if (!email) errors.push("Email is required");
    if (!phone) errors.push("Phone number is required");
    if (!password) errors.push("Password is required");

    if (errors.length > 0) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    // Vérification du format d'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Vérification si l'utilisateur existe déjà par numéro de téléphone
    const existingUser = await prisma.user.findUnique({
      where: { phone },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Phone number already registered" },
        { status: 400 }
      );
    }

    // Vérification du parent si fourni
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

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        phone,
        email,
        password: hashedPassword,
        parent: parent || undefined,
      },
    });

    return NextResponse.json(
      { message: "User registered successfully", user },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Registration failed" },
      { status: 400 }
    );
  }
}
