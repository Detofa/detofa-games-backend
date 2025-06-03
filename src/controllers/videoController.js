const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const getAllVideos = async (req, res) => {
  try {
    const videos = await prisma.video.findMany();
    res.json(videos);
  } catch (error) {
    res.status(500).json({ error: "Error fetching videos" });
  }
};

module.exports = {
  getAllVideos,
};
