// app/api/videos/all/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma.config";
import { getUserIdFromRequest } from "@/app/lib/auth";

export async function GET(req: NextRequest) {
  const userId = getUserIdFromRequest(req);

  if (!userId) {
    return NextResponse.json(
      { error: "User not authenticated" },
      { status: 401 }
    );
  }

  try {
    const videos = await prisma.video.findMany({
      where: {
        VideoView: {
          none: {
            userId,
          },
        },
      },
      include: {
        _count: {
          select: {
            VideoView: true,
          },
        },
      },
    });

    const availableVideos = videos.filter(
      (video) => video._count.VideoView < video.viewLimit
    );

    const videosWithViewInfo = availableVideos.map((video) => ({
      ...video,
      currentViews: video._count.VideoView,
      remainingViews: video.viewLimit - video._count.VideoView,
      canWatch: true,
    }));

    return NextResponse.json(videosWithViewInfo, { status: 200 });
  } catch (error) {
    console.error("Error in getAllVideos:", error);
    return NextResponse.json(
      { error: "Error fetching videos" },
      { status: 500 }
    );
  }
}
