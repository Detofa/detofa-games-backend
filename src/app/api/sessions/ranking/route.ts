import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma.config";

export async function POST(req: NextRequest) {
  try {
    const { sessionId } = await req.json();
    if (!sessionId) {
      return NextResponse.json(
        { error: "sessionId is required" },
        { status: 400 }
      );
    }
    const players = await prisma.mathAdditionSessionPlayer.findMany({
      where: { sessionId },
      include: {
        user: { select: { name: true } },
      },
      orderBy: [{ ranking: "asc" }, { joinedAt: "asc" }],
    });
    const result = players.map((p) => ({
      userId: p.userId,
      name: p.user?.name ?? null,
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
