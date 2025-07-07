import pkg from "@prisma/client";
const { PrismaClient } = pkg;

// Create a single Prisma client instance
const prisma = new PrismaClient();

// Handle graceful shutdown
process.on("beforeExit", async () => {
  await prisma.$disconnect();
});

export default prisma;
