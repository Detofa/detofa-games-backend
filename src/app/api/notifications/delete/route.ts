import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/api/utils/prisma";
import { getUserIdFromRequest } from "@/app/lib/auth";

// DELETE /api/notifications/delete - Delete a notification for the user - ID in body
export async function DELETE(req: NextRequest) {
  try {
    const userId = getUserIdFromRequest(req);

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized: Invalid or missing token" },
        { status: 401 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Parse request body
    const body = await req.json();
    const { id: notificationId } = body;

    // Validate required fields
    if (!notificationId) {
      return NextResponse.json(
        { error: "Notification ID is required" },
        { status: 400 }
      );
    }

    // Check if the notification exists and belongs to the user
    const userNotification = await prisma.userNotification.findUnique({
      where: {
        userId_notificationId: {
          userId: userId,
          notificationId: notificationId,
        },
      },
    });

    if (!userNotification) {
      return NextResponse.json(
        { error: "Notification not found or access denied" },
        { status: 404 }
      );
    }

    // Delete the user notification (this only removes the association, not the notification itself)
    await prisma.userNotification.delete({
      where: {
        userId_notificationId: {
          userId: userId,
          notificationId: notificationId,
        },
      },
    });

    return NextResponse.json(
      { message: "Notification deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting notification:", error);
    return NextResponse.json(
      { error: "Failed to delete notification" },
      { status: 500 }
    );
  }
}
