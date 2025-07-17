import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma.config";
import { getUserIdFromRequest } from "@/app/lib/auth";

export async function GET(req: NextRequest) {
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

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { password, createdAt, updatedAt, ...safeUser } = user;

    return NextResponse.json(safeUser, { status: 200 });
  } catch (error) {
    console.error("Profile error:", error);
    return NextResponse.json(
      { error: "Invalid or expired token" },
      { status: 401 }
    );
  }
}

export async function DELETE(req: NextRequest) {
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

    // Create a DataDeletionRequest
    await prisma.dataDeletionRequest.create({
      data: { userId },
    });

    return NextResponse.json(
      { message: "Data deletion request created." },
      { status: 201 }
    );
  } catch (error) {
    console.error("Data deletion request error:", error);
    return NextResponse.json(
      { error: "Failed to create data deletion request" },
      { status: 500 }
    );
  }
}
