import prisma from "../utils/prisma.js";

export async function transferFunds(req, res) {
  const { toUserPhone, amount, note } = req.body;
  const fromUserId = req.userId; // From auth middleware

  try {
    // Validate required fields
    if (!toUserPhone || !amount) {
      return res.status(400).json({
        error: "Recipient phone number and amount are required",
      });
    }

    // Validate amount is positive and above minimum
    if (amount <= 99) {
      return res.status(400).json({
        error: "Amount must be greater than 99",
      });
    }

    // Find recipient by phone number
    const recipient = await prisma.user.findUnique({
      where: { phone: toUserPhone },
      select: { id: true, name: true, phone: true },
    });

    if (!recipient) {
      return res.status(404).json({ error: "Recipient not found" });
    }

    // Check if user is trying to send to themselves
    if (fromUserId === recipient.id) {
      return res.status(400).json({
        error: "Cannot send funds to yourself",
      });
    }

    // Calculate transaction fee (3% rounded up to nearest integer)
    const transactionFee = Math.ceil(amount * 0.03);
    const totalAmount = amount + transactionFee;

    // Use database transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Get sender's current balance
      const sender = await tx.user.findUnique({
        where: { id: fromUserId },
        select: { account: true, name: true },
      });

      if (!sender) {
        throw new Error("Sender not found");
      }

      // Check if sender has sufficient funds
      if (sender.account < totalAmount) {
        throw new Error("Insufficient funds");
      }

      // Update sender's account (deduct amount + fee)
      await tx.user.update({
        where: { id: fromUserId },
        data: { account: { decrement: totalAmount } },
      });

      // Update recipient's account (add only the transfer amount, not the fee)
      await tx.user.update({
        where: { id: recipient.id },
        data: { account: { increment: amount } },
      });

      // Create transaction record
      const transaction = await tx.transaction.create({
        data: {
          fromUserId,
          toUserId: recipient.id,
          amount,
          transactionFee,
          note: note || null,
        },
        include: {
          fromUser: {
            select: { id: true, name: true, phone: true },
          },
          toUser: {
            select: { id: true, name: true, phone: true },
          },
        },
      });

      return transaction;
    });

    res.status(200).json({
      message: "Transfer completed successfully",
      transaction: {
        id: result.id,
        amount: result.amount,
        transactionFee: result.transactionFee,
        totalAmount: result.amount + result.transactionFee,
        fromUser: result.fromUser,
        toUser: result.toUser,
        note: result.note,
        createdAt: result.createdAt,
      },
    });
  } catch (error) {
    console.error("Transfer error:", error);

    if (error.message === "Insufficient funds") {
      return res.status(400).json({ error: "Insufficient funds" });
    }

    if (
      error.message === "Sender not found" ||
      error.message === "Recipient not found"
    ) {
      return res.status(404).json({ error: error.message });
    }

    res.status(500).json({ error: "Internal server error" });
  }
}

export async function getTransactionHistory(req, res) {
  const userId = req.userId;
  const { page = 1, limit = 10 } = req.query;

  try {
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const transactions = await prisma.transaction.findMany({
      where: {
        OR: [{ fromUserId: userId }, { toUserId: userId }],
      },
      include: {
        fromUser: {
          select: { id: true, name: true, phone: true },
        },
        toUser: {
          select: { id: true, name: true, phone: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: parseInt(limit),
    });

    const total = await prisma.transaction.count({
      where: {
        OR: [{ fromUserId: userId }, { toUserId: userId }],
      },
    });

    res.status(200).json({
      transactions: transactions.map((t) => ({
        id: t.id,
        amount: t.amount,
        transactionFee: t.transactionFee,
        totalAmount: t.amount + t.transactionFee,
        fromUser: t.fromUser,
        toUser: t.toUser,
        note: t.note,
        createdAt: t.createdAt,
        type: t.fromUserId === userId ? "sent" : "received",
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Get transaction history error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
