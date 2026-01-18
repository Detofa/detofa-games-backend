import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma.config";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { appId } = data;
    
    if (!appId) {
      return NextResponse.json({ error: "App ID is required" }, { status: 400 });
    }

    // Increment download count
    const app = await prisma.app.update({
      where: { id: appId },
      data: {
        downloadCount: {
          increment: 1,
        },
      },
    });
    
    return NextResponse.json({ 
      success: true, 
      fileUrl: app.fileUrl,
      downloadCount: app.downloadCount 
    });
  } catch (error: any) {
    console.error("Error tracking download:", error);
    return NextResponse.json(
      { error: error.message || "Failed to track download" },
      { status: 500 }
    );
  }
}

