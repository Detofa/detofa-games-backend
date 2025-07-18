import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma.config";
import { getUserIdFromRequest } from "@/app/lib/auth";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "Missing or invalid token" },
      { status: 401 }
    );
  }

  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { account: { increment: 1 } },
      select: { id: true, account: true },
    });

    return NextResponse.json(
      { message: "Account incremented", account: updatedUser.account },
      { status: 200 }
    );
  } catch (error) {
    console.error("Increment account error:", error);
    return NextResponse.json(
      { error: "Failed to increment account" },
      { status: 500 }
    );
  }
}
