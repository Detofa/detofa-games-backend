import pkg from "@prisma/client";
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

export const checkVideoView = async (req, res) => {
  const { videoId } = req.body;
  const userId = req.userId;

  if (!videoId) {
    return res.status(400).json({ error: "videoId is required" });
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
        message: "User has already viewed this video.",
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
      });
    }

    // If video can be watched, create view and update accounts
    const result = await prisma.$transaction(async (tx) => {
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
      message: "User can watch the video.",
      pointsEarned: result.videoPoint,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
