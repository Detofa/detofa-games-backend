import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma.config";
import { isAdmin } from "@/app/api/utils/authHelper";

export async function GET(req: NextRequest) {
  if (!isAdmin(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const apps = await prisma.app.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(apps);
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const data = await req.json();
    const step = data.step || 1; // Default to step 1 if not provided

    if (step === 1) {
      // Step 1: Basic Information - Create initial app record
      if (!data.name || !data.platform || !data.version) {
        return NextResponse.json(
          { error: "Missing required fields: name, platform, version" },
          { status: 400 }
        );
      }

      const app = await prisma.app.create({
        data: {
          name: data.name,
          platform: data.platform,
          version: data.version,
          description: data.description || null,
          fileUrl: null,
          iconUrl: null,
          previewImages: null,
          variants: null,
          size: data.size || null,
          minVersion: data.minVersion || null,
          releaseNotes: data.releaseNotes || null,
          status: data.status || "ACTIVE",
          downloadCount: 0,
          completedSteps: { step1: true },
          isComplete: false,
        },
      });

      return NextResponse.json(app);
    } else {
      // Steps 2 and 3: Update existing app record
      if (!data.id) {
        return NextResponse.json(
          { error: "App ID is required for steps 2 and 3" },
          { status: 400 }
        );
      }

      const updateData: any = {};
      const completedSteps: any = {};

      if (step === 2) {
        // Step 2: App File
        if (data.fileUrl) {
          updateData.fileUrl = data.fileUrl;
          updateData.size = data.size || null;
          completedSteps.step2 = true;
        }
      } else if (step === 3) {
        // Step 3: Media
        updateData.iconUrl = data.iconUrl || null;
        updateData.previewImages = data.previewImages
          ? JSON.parse(JSON.stringify(data.previewImages))
          : null;
        completedSteps.step3 = true;
        updateData.isComplete = true; // Mark as complete when step 3 is done
      }

      // Get current completed steps
      const currentApp = await prisma.app.findUnique({
        where: { id: data.id },
        select: { completedSteps: true },
      });

      const existingSteps = (currentApp?.completedSteps as any) || {};
      const newCompletedSteps = { ...existingSteps, ...completedSteps };

      updateData.completedSteps = newCompletedSteps;

      const app = await prisma.app.update({
        where: { id: data.id },
        data: updateData,
      });

      return NextResponse.json(app);
    }
  } catch (error: any) {
    console.error("Error creating/updating app:", error);
    return NextResponse.json(
      { error: error.message || "Failed to save app" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  if (!isAdmin(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const data = await req.json();
    const { id, step, ...updateData } = data; // Exclude 'step' as it's not a field in the App model

    if (!id) {
      return NextResponse.json(
        { error: "App ID is required" },
        { status: 400 }
      );
    }

    // Handle previewImages if provided
    if (updateData.previewImages !== undefined) {
      updateData.previewImages = updateData.previewImages
        ? JSON.parse(JSON.stringify(updateData.previewImages))
        : null;
    }

    const app = await prisma.app.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(app);
  } catch (error: any) {
    console.error("Error updating app:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update app" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  if (!isAdmin(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "App ID is required" },
        { status: 400 }
      );
    }

    await prisma.app.delete({
      where: { id },
    });

    return NextResponse.json({ message: "App deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting app:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete app" },
      { status: 500 }
    );
  }
}
