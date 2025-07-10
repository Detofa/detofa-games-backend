import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma.config";

export async function GET() {
  const products = await prisma.product.findMany({
    include: { category: true, images: true, availability: true },
  });
  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
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
  const product = await prisma.product.create({
    data,
  });
  return NextResponse.json(product);
}
