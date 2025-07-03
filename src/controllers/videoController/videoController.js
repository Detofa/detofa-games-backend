import pkg from "@prisma/client";
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

export const getAllVideos = async (req, res) => {
  try {
    const userId = req.userId;
    // Get all videos the user has NOT viewed
    const videos = await prisma.video.findMany({
      where: {
        VideoView: {
          none: {
            userId: userId,
          },
        },
      },
    });
    res.json(videos);
  } catch (error) {
    res.status(500).json({ error: "Error fetching videos" });
  }
};

export const payoutForVideo = async (req, res) => {
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

    // Create a VideoView if not already exists
    const userView = await prisma.videoView.findUnique({
      where: {
        userId_videoId: {
          userId,
          videoId,
        },
      },
    });
    if (!userView) {
      await prisma.videoView.create({
        data: {
          userId,
          videoId,
        },
      });
    }

    // Update the user's account by adding videoPoint
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        account: {
          increment: video.videoPoint,
        },
      },
    });

    return res.json({ success: true, newAccount: user.account });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
