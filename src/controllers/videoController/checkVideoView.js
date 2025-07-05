import pkg from "@prisma/client";
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

export const checkVideoView = async (req, res) => {
  const { videoId } = req.body;
  const userId = req.userId;

  if (!videoId) {
    return res.status(400).json({ error: "videoId is required" });
  }

  if (!userId) {
    return res.status(401).json({ error: "User not authenticated" });
  }

  try {
    // Find the video
    const video = await prisma.video.findUnique({
      where: { id: videoId },
    });

    if (!video) {
      return res.status(404).json({ error: "Video not found" });
    }

    // Check if current user has already viewed this video
    const userView = await prisma.videoView.findUnique({
      where: {
        userId_videoId: {
          userId,
          videoId,
        },
      },
    });

    if (userView) {
      return res.status(403).json({
        canWatch: false,
        message: "You have already viewed this video.",
        alreadyViewed: true,
      });
    }

    // Count total views for this video
    const viewCount = await prisma.videoView.count({
      where: { videoId },
    });

    if (viewCount >= video.viewLimit) {
      return res.status(403).json({
        canWatch: false,
        message: "View limit reached for this video.",
        viewLimitReached: true,
        currentViews: viewCount,
        maxViews: video.viewLimit,
      });
    }

    // If video can be watched, create view and update accounts
    const result = await prisma.$transaction(async (tx) => {
      // Double-check view limit within transaction to prevent race conditions
      const currentViewCount = await tx.videoView.count({
        where: { videoId },
      });

      if (currentViewCount >= video.viewLimit) {
        throw new Error("View limit reached during transaction");
      }

      // Double-check user hasn't already viewed within transaction
      const existingUserView = await tx.videoView.findUnique({
        where: {
          userId_videoId: {
            userId,
            videoId,
          },
        },
      });

      if (existingUserView) {
        throw new Error("User has already viewed this video");
      }

      // Create video view record
      const newView = await tx.videoView.create({
        data: {
          userId,
          videoId,
        },
      });

      // Increment video viewsNumber
      await tx.video.update({
        where: { id: videoId },
        data: { viewsNumber: { increment: 1 } },
      });

      // Add videoPoint to user account
      await tx.user.update({
        where: { id: userId },
        data: { account: { increment: video.videoPoint } },
      });

      return { newView, videoPoint: video.videoPoint };
    });

    return res.json({
      canWatch: true,
      message: "You can watch the video.",
      pointsEarned: result.videoPoint,
      videoInfo: {
        id: video.id,
        company: video.company,
        type: video.type,
        videoPoint: video.videoPoint,
        viewLimit: video.viewLimit,
        currentViews: viewCount + 1,
      },
    });
  } catch (error) {
    console.error("Error in checkVideoView:", error);

    // Handle specific transaction errors
    if (error.message === "View limit reached during transaction") {
      return res.status(403).json({
        canWatch: false,
        message: "View limit reached for this video.",
        viewLimitReached: true,
      });
    }

    if (error.message === "User has already viewed this video") {
      return res.status(403).json({
        canWatch: false,
        message: "You have already viewed this video.",
        alreadyViewed: true,
      });
    }

    return res.status(500).json({ error: "Internal server error" });
  }
};
