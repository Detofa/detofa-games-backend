import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma.config";
import { isAdmin } from "@/app/api/utils/authHelper";
// @ts-ignore: No type definitions for cloudinary
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET(req: NextRequest) {
  if (!isAdmin(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const images = await prisma.productImage.findMany({
    include: { product: true },
  });
  return NextResponse.json(images);
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const data = await req.json();
  let uploadedUrl = data.imageUrl;
  try {
    // Only upload if not already a Cloudinary URL
    if (!uploadedUrl.includes("res.cloudinary.com")) {
      const uploadRes = await cloudinary.uploader.upload(uploadedUrl, {
        folder: "product-images",
      });
      const uploadData = await uploadRes.json();
      console.log(uploadData); // Add this line for debugging
      if (!uploadData.secure_url) {
        return NextResponse.json(
          { error: "Image upload failed" },
          { status: 500 }
        );
      }
      uploadedUrl = uploadRes.secure_url;
    }
  } catch (err) {
    return NextResponse.json(
      { error: "Cloudinary upload failed" },
      { status: 500 }
    );
  }
  const image = await prisma.productImage.create({
    data: { ...data, imageUrl: uploadedUrl },
  });
  return NextResponse.json(image);
}
