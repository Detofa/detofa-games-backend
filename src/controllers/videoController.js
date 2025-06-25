import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getAllVideos = async (req, res) => {
  try {
    const videos = await prisma.video.findMany();
    res.json(videos);
  } catch (error) {
    res.status(500).json({ error: "Error fetching videos" });
  }
};
