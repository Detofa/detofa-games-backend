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

    const existingView = await prisma.videoView.findUnique({
      where: {
        userId_videoId: {
          userId,
          videoId,
        },
      },
    });

    if (existingView) {
      return NextResponse.json(
        {
          success: false,
          message: "You have already received payout for this video.",
          alreadyPaid: true,
        },
        { status: 403 }
      );
    }

    const currentViewCount = await prisma.videoView.count({
      where: { videoId },
    });

    if (currentViewCount >= video.viewLimit) {
      return NextResponse.json(
        {
          success: false,
          message: "View limit reached for this video.",
          viewLimitReached: true,
        },
        { status: 403 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const recheckViewCount = await tx.videoView.count({
        where: { videoId },
      });

      if (recheckViewCount >= video.viewLimit) {
        throw new Error("View limit reached during transaction");
      }

      const duplicateView = await tx.videoView.findUnique({
        where: {
          userId_videoId: {
            userId,
            videoId,
          },
        },
      });

      if (duplicateView) {
        throw new Error("User has already received payout for this video");
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
        newAccount: updatedUser.account,
        videoPoint: video.videoPoint,
      };
    });

    return NextResponse.json(
      {
        success: true,
        newAccount: result.newAccount,
        pointsEarned: result.videoPoint,
        message: "Payout processed successfully",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error in payoutForVideo:", error);

    if (error.message === "View limit reached during transaction") {
      return NextResponse.json(
        {
          success: false,
          message: "View limit reached for this video.",
          viewLimitReached: true,
        },
        { status: 403 }
      );
    }

    if (error.message === "User has already received payout for this video") {
      return NextResponse.json(
        {
          success: false,
          message: "You have already received payout for this video.",
          alreadyPaid: true,
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
