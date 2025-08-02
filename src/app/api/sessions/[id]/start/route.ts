import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma.config";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const sessionId = params.id;
  if (!sessionId) {
    return NextResponse.json(
      { error: "Session ID is required" },
      { status: 400 }
    );
  }
  try {
    const { userId } = await req.json();
    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }
    // Get session and players
    const session = await prisma.mathAdditionSession.findUnique({
      where: { id: sessionId },
      include: { players: true },
    });
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }
    if (session.hostUserId !== userId) {
      return NextResponse.json(
        { error: "Only the host can start the session" },
        { status: 403 }
      );
    }
    if (session.players.length < 3) {
      return NextResponse.json(
        { error: "At least 3 players required to start" },
        { status: 400 }
      );
    }
    // Set status to PLAYING
    const updated = await prisma.mathAdditionSession.update({
      where: { id: sessionId },
      data: { status: "PLAYING" },
    });
    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error("Error starting session:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
