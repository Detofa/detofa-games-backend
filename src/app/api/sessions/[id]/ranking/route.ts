import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma.config";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: sessionId } = await params;
  if (!sessionId) {
    return NextResponse.json(
      { error: "Session ID is required" },
      { status: 400 }
    );
  }

  try {
    const players = await prisma.mathAdditionSessionPlayer.findMany({
      where: { sessionId },
      include: {
        user: { select: { name: true } },
      },
      orderBy: [
        { ranking: "asc" },
        { joinedAt: "asc" }, // fallback order
      ],
    });

    const result = players.map((p) => ({
      userId: p.userId,
      username: p.user?.name ?? null,
      ranking: p.ranking,
      eliminated: p.eliminated,
    }));

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Error fetching session ranking:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
