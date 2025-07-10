import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma.config";
import { isAdmin } from "@/app/api/utils/authHelper";

export async function GET(req: NextRequest) {
  if (!isAdmin(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const categories = await prisma.productCategory.findMany();
  return NextResponse.json(categories);
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const data = await req.json();
  // Generate slug from name
  const slug = data.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
  const category = await prisma.productCategory.create({
    data: { ...data, slug },
  });
  return NextResponse.json(category);
}
