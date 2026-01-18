import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma.config";
import { writeFile, unlink } from "fs/promises";
import path from "path";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const name = formData.get("name") as string;
    const platform = formData.get("platform") as "IOS" | "ANDROID" | "WEB";
    const version = formData.get("version") as string;
    const description = formData.get("description") as string;
    const size = formData.get("size") as string;
    const minVersion = formData.get("minVersion") as string;
    const releaseNotes = formData.get("releaseNotes") as string;
    const status = formData.get("status") as "ACTIVE" | "INACTIVE" | "BETA";
    const appFile = formData.get("appFile") as File;
    const iconFile = formData.get("iconFile") as File;
    const previewImages = formData.getAll("previewImages") as File[];

    if (!name || !platform || !version || !appFile) {
      return NextResponse.json(
        { error: "Name, platform, version, and app file are required" },
        { status: 400 }
      );
    }

    // Upload app file to Cloudinary
    const appFileBuffer = Buffer.from(await appFile.arrayBuffer());
    const appFileName = `${Date.now()}-${appFile.name}`;
    const appUploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            resource_type: "raw",
            public_id: appFileName,
            folder: "app-files",
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        )
        .end(appFileBuffer);
    });

    let iconUrl = null;
    if (iconFile) {
      const iconFileBuffer = Buffer.from(await iconFile.arrayBuffer());
      const iconFileName = `${Date.now()}-${iconFile.name}`;
      const iconUploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              resource_type: "image",
              public_id: iconFileName,
              folder: "app-icons",
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          )
          .end(iconFileBuffer);
      });
      iconUrl = (iconUploadResult as any).secure_url;
    }

    let previewImageUrls: string[] = [];
    if (previewImages.length > 0) {
      const uploadPromises = previewImages.map(async (file) => {
        const fileBuffer = Buffer.from(await file.arrayBuffer());
        const fileName = `${Date.now()}-${file.name}`;
        return new Promise<string>((resolve, reject) => {
          cloudinary.uploader
            .upload_stream(
              {
                resource_type: "image",
                public_id: fileName,
                folder: "app-previews",
              },
              (error, result) => {
                if (error) reject(error);
                else resolve((result as any).secure_url);
              }
            )
            .end(fileBuffer);
        });
      });
      previewImageUrls = await Promise.all(uploadPromises);
    }

    const app = await prisma.app.create({
      data: {
        name,
        platform,
        version,
        description: description || null,
        fileUrl: (appUploadResult as any).secure_url,
        iconUrl,
        previewImages:
          previewImageUrls.length > 0 ? (previewImageUrls as any) : null,
        size: size || null,
        minVersion: minVersion || null,
        releaseNotes: releaseNotes || null,
        status: status || "ACTIVE",
      },
    });

    return NextResponse.json(app, { status: 201 });
  } catch (error: any) {
    console.error("Error creating app:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create app" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const platform = searchParams.get("platform");

    const where: any = {
      status: "ACTIVE",
    };

    if (platform) {
      where.platform = platform;
    }

    const apps = await prisma.app.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(apps);
  } catch (error: any) {
    console.error("Error fetching apps:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch apps" },
      { status: 500 }
    );
  }
}
