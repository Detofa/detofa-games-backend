import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { Gender } from "@prisma/client";
import prisma from "@/app/lib/prisma.config";

export async function GET() {
  const users = await prisma.user.findMany();
  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const user = await prisma.user.create({ data });
  return NextResponse.json(user);
}
