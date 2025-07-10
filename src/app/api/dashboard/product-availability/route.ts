import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma.config";
import { isAdmin } from "@/app/api/utils/authHelper";

export async function GET(req: NextRequest) {
  if (!isAdmin(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const availabilities = await prisma.productAvailability.findMany({
    include: { product: true },
  });
  return NextResponse.json(availabilities);
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const data = await req.json();
  const availability = await prisma.productAvailability.create({ data });
  return NextResponse.json(availability);
}
