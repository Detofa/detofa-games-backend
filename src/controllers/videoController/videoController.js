import prisma from "../../utils/prisma.js";

export const getAllVideos = async (req, res) => {
  try {
    const userId = req.userId;
    console.log("the user", userId);

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    // Get all videos that:
    // 1. The current user has NOT viewed yet
    // 2. Haven't reached their view limit
    const videos = await prisma.video.findMany({
      where: {
        AND: [
          {
            VideoView: {
              none: {
                userId: userId,
              },
            },
          },
        ],
      },
      include: {
        _count: {
          select: {
            VideoView: true,
          },
        },
      },
    });

    // Filter videos that haven't reached their view limit
    const availableVideos = videos.filter(
      (video) => video._count.VideoView < video.viewLimit
    );

    // Transform the response to include view count information
    const videosWithViewInfo = availableVideos.map((video) => ({
      ...video,
      currentViews: video._count.VideoView,
      remainingViews: video.viewLimit - video._count.VideoView,
      canWatch: true,
    }));

    res.json(videosWithViewInfo);
  } catch (error) {
    console.error("Error in getAllVideos:", error);
    res.status(500).json({ error: "Error fetching videos" });
  }
};

export const payoutForVideo = async (req, res) => {
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
        success: false,
        message: "You have already received payout for this video.",
        alreadyPaid: true,
      });
    }

    // Count total views for this video
    const viewCount = await prisma.videoView.count({
      where: { videoId },
    });

    if (viewCount >= video.viewLimit) {
      return res.status(403).json({
        success: false,
        message: "View limit reached for this video.",
        viewLimitReached: true,
      });
    }

    // Process payout in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Double-check conditions within transaction
      const currentViewCount = await tx.videoView.count({
        where: { videoId },
      });

      if (currentViewCount >= video.viewLimit) {
        throw new Error("View limit reached during transaction");
      }

      const existingUserView = await tx.videoView.findUnique({
        where: {
          userId_videoId: {
            userId,
            videoId,
          },
        },
      });

      if (existingUserView) {
        throw new Error("User has already received payout for this video");
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

      // Update the user's account by adding videoPoint
      const user = await tx.user.update({
        where: { id: userId },
        data: {
          account: {
            increment: video.videoPoint,
          },
        },
      });

      return { newView, user, videoPoint: video.videoPoint };
    });

    return res.json({
      success: true,
      newAccount: result.user.account,
      pointsEarned: result.videoPoint,
      message: "Payout processed successfully",
    });
  } catch (error) {
    console.error("Error in payoutForVideo:", error);

    // Handle specific transaction errors
    if (error.message === "View limit reached during transaction") {
      return res.status(403).json({
        success: false,
        message: "View limit reached for this video.",
        viewLimitReached: true,
      });
    }

    if (error.message === "User has already received payout for this video") {
      return res.status(403).json({
        success: false,
        message: "You have already received payout for this video.",
        alreadyPaid: true,
      });
    }

    return res.status(500).json({ error: "Internal server error" });
  }
};
