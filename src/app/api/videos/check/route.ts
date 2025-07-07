import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma.config";
import { getUserIdFromRequest } from "@/app/lib/auth";

export async function POST(req: NextRequest) {
  const userId = getUserIdFromRequest(req);

  if (!userId) {
    return NextResponse.json(
      { error: "User not authenticated" },
      { status: 401 }
    );
  }

  const body = await req.json();
  const { videoId } = body;

  if (!videoId) {
    return NextResponse.json({ error: "videoId is required" }, { status: 400 });
  }

  try {
    const video = await prisma.video.findUnique({
      where: { id: videoId },
    });

    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    const userView = await prisma.videoView.findUnique({
      where: {
        userId_videoId: {
          userId,
          videoId,
        },
      },
    });

    if (userView) {
      return NextResponse.json(
        {
          canWatch: false,
          message: "You have already viewed this video.",
          alreadyViewed: true,
        },
        { status: 403 }
      );
    }

    const totalViews = await prisma.videoView.count({
      where: { videoId },
    });

    if (totalViews >= video.viewLimit) {
      return NextResponse.json(
        {
          canWatch: false,
          message: "View limit reached for this video.",
          viewLimitReached: true,
          currentViews: totalViews,
          maxViews: video.viewLimit,
        },
        { status: 403 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const currentViewCount = await tx.videoView.count({
        where: { videoId },
      });

      if (currentViewCount >= video.viewLimit) {
        throw new Error("View limit reached during transaction");
      }

      const existingView = await tx.videoView.findUnique({
        where: {
          userId_videoId: {
            userId,
            videoId,
          },
        },
      });

      if (existingView) {
        throw new Error("User has already viewed this video");
      }

      await tx.videoView.create({
        data: {
          userId,
          videoId,
        },
      });

      await tx.video.update({
        where: { id: videoId },
        data: {
          viewsNumber: { increment: 1 },
        },
      });

      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          account: {
            increment: video.videoPoint,
          },
        },
      });

      return {
        videoPoint: video.videoPoint,
        newAccount: updatedUser.account,
      };
    });

    return NextResponse.json(
      {
        canWatch: true,
        message: "You can watch the video.",
        pointsEarned: result.videoPoint,
        videoInfo: {
          id: video.id,
          company: video.company,
          type: video.type,
          videoPoint: video.videoPoint,
          viewLimit: video.viewLimit,
          currentViews: totalViews + 1,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error in checkVideoView:", error);

    if (error.message === "View limit reached during transaction") {
      return NextResponse.json(
        {
          canWatch: false,
          message: "View limit reached for this video.",
          viewLimitReached: true,
        },
        { status: 403 }
      );
    }

    if (error.message === "User has already viewed this video") {
      return NextResponse.json(
        {
          canWatch: false,
          message: "You have already viewed this video.",
          alreadyViewed: true,
        },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
