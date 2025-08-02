import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma.config";

const MAX_PLAYERS = 16;

export async function POST(req: NextRequest) {
  try {
    const { userId, sessionId, numberCount } = await req.json();
    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }
    let session;
    if (sessionId) {
      session = await prisma.mathAdditionSession.findUnique({
        where: { id: sessionId },
        include: { players: true },
      });
      if (!session) {
        return NextResponse.json(
          { error: "Session not found" },
          { status: 404 }
        );
      }
      if (session.players.length >= MAX_PLAYERS) {
        // Session is full, do not join
        session = null;
      }
    }
    if (!session) {
      // Find a GROUP session with space
      session = await prisma.mathAdditionSession.findFirst({
        where: {
          gameMode: "GROUP",
          status: "WAITING",
        },
        include: { players: true },
        orderBy: { createdAt: "asc" },
      });
      if (!session || session.players.length >= MAX_PLAYERS) {
        // Create new session
        const count =
          typeof numberCount === "number" && numberCount > 0 ? numberCount : 10;
        session = await prisma.mathAdditionSession.create({
          data: {
            hostUserId: userId,
            gameMode: "GROUP",
            numberCount: count,
            status: "WAITING",
            players: {
              create: {
                userId,
                isHost: true,
              },
            },
            numbers: {
              create: Array.from({ length: count }).map((_, i) => ({
                index: i,
                value: Math.floor(Math.random() * 101),
              })),
            },
          },
          include: { players: true, numbers: true },
        });
        return NextResponse.json(session, { status: 201 });
      }
    }
    // Only allow joining if session is not full
    if (session.players.length >= MAX_PLAYERS) {
      return NextResponse.json({ error: "Session is full" }, { status: 400 });
    }
    // Join the session if not already joined
    const alreadyJoined = session.players.some((p) => p.userId === userId);
    if (alreadyJoined) {
      return NextResponse.json(session, { status: 200 });
    }
    // If this is the first player, make them host
    const isHost = session.players.length === 0;
    const player = await prisma.mathAdditionSessionPlayer.create({
      data: {
        sessionId: session.id,
        userId,
        isHost,
      },
    });
    // Refresh session players
    const updatedSession = await prisma.mathAdditionSession.findUnique({
      where: { id: session.id },
      include: {
        players: { include: { user: { select: { name: true, id: true } } } },
        numbers: true,
      },
    });
    if (!updatedSession) {
      return NextResponse.json(
        { error: "Session not found after join" },
        { status: 500 }
      );
    }
    // Prepare player list and count
    const playerList = updatedSession.players.map((p) => ({
      userId: p.userId,
      name: p.user?.name ?? p.userId,
      isHost: p.isHost,
      eliminated: p.eliminated,
    }));
    const playerCount = playerList.length;
    return NextResponse.json(
      { session: updatedSession, player, playerCount, playerList },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error joining session:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
