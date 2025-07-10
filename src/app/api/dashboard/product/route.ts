import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma.config";
import { isAdmin } from "@/app/api/utils/authHelper";

export async function GET(req: NextRequest) {
  if (!isAdmin(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const products = await prisma.product.findMany({
    include: { category: true, images: true, availability: true },
  });
  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const data = await req.json();
  if (
    typeof data.pointprice !== "number" ||
    !Number.isInteger(data.pointprice)
  ) {
    return NextResponse.json(
      { error: "pointprice must be an integer" },
      { status: 400 }
    );
  }
  const product = await prisma.product.create({ data });
  return NextResponse.json(product);
}
