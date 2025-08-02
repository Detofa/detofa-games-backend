import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma.config";

export async function POST(req: NextRequest) {
  try {
    const { userId, gameMode } = await req.json();
    if (!userId || !gameMode) {
      return NextResponse.json(
        { error: "userId and gameMode are required" },
        { status: 400 }
      );
    }
    // Create session
    const session = await prisma.mathAdditionSession.create({
      data: {
        hostUserId: userId,
        gameMode,
        players: {
          create: {
            userId,
            isHost: true,
          },
        },
        numbers: {
          create: Array.from({ length: 10 }).map((_, i) => ({
            index: i,
            value: Math.floor(Math.random() * 101),
          })),
        },
      },
      include: {
        players: true,
        numbers: true,
      },
    });
    return NextResponse.json(session, { status: 201 });
  } catch (error) {
    console.error("Error creating session:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
