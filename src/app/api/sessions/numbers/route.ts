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
    const numbers = await prisma.mathAdditionSessionNumber.findMany({
      where: { sessionId },
      orderBy: { index: "asc" },
      select: { index: true, value: true },
    });
    return NextResponse.json(numbers, { status: 200 });
  } catch (error) {
    console.error("Error fetching numbers:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
