import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma.config";
import { getUserIdFromRequest } from "@/app/lib/auth";

export async function POST(req: NextRequest) {
  const fromUserId = getUserIdFromRequest(req);
  if (!fromUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { toUserPhone, amount, note } = body;

  if (!toUserPhone || !amount) {
    return NextResponse.json(
      { error: "Recipient phone number and amount are required" },
      { status: 400 }
    );
  }

  if (amount <= 99) {
    return NextResponse.json(
      { error: "Amount must be greater than 99" },
      { status: 400 }
    );
  }

  try {
    const recipient = await prisma.user.findUnique({
      where: { phone: toUserPhone },
      select: { id: true, name: true, phone: true },
    });

    if (!recipient) {
      return NextResponse.json(
        { error: "Recipient not found" },
        { status: 404 }
      );
    }

    if (recipient.id === fromUserId) {
      return NextResponse.json(
        { error: "Cannot send funds to yourself" },
        { status: 400 }
      );
    }

    const transactionFee = Math.ceil(amount * 0.03);
    const totalAmount = amount + transactionFee;

    const result = await prisma.$transaction(async (tx) => {
      const sender = await tx.user.findUnique({
        where: { id: fromUserId },
        select: { account: true },
      });

      if (!sender) throw new Error("Sender not found");
      if (sender.account < totalAmount) throw new Error("Insufficient funds");

      await tx.user.update({
        where: { id: fromUserId },
        data: { account: { decrement: totalAmount } },
      });

      await tx.user.update({
        where: { id: recipient.id },
        data: { account: { increment: amount } },
      });

      const transaction = await tx.transaction.create({
        data: {
          fromUserId,
          toUserId: recipient.id,
          amount,
          transactionFee,
          note: note || null,
        },
        include: {
          fromUser: { select: { id: true, name: true, phone: true } },
          toUser: { select: { id: true, name: true, phone: true } },
        },
      });

      return transaction;
    });

    return NextResponse.json(
      {
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
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Transfer error:", error);

    const knownErrors = [
      "Insufficient funds",
      "Sender not found",
      "Recipient not found",
    ];

    if (knownErrors.includes(error.message)) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
