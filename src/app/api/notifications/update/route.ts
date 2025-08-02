import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/api/utils/prisma";
import { getUserIdFromRequest } from "@/app/lib/auth";

// PUT /api/notifications/update - Update a notification (mark as read, etc.) - ID in body
export async function PUT(req: NextRequest) {
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
    const { id: notificationId, isRead } = body;

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
      include: {
        notification: true,
      },
    });

    if (!userNotification) {
      return NextResponse.json(
        { error: "Notification not found or access denied" },
        { status: 404 }
      );
    }

    // Update the user notification
    const updatedUserNotification = await prisma.userNotification.update({
      where: {
        userId_notificationId: {
          userId: userId,
          notificationId: notificationId,
        },
      },
      data: {
        isRead: isRead !== undefined ? isRead : userNotification.isRead,
        updated: new Date(),
      },
      include: {
        notification: true,
      },
    });

    // Return the updated notification
    const response = {
      id: updatedUserNotification.notification.id,
      title: updatedUserNotification.notification.title,
      body: updatedUserNotification.notification.body,
      type: updatedUserNotification.notification.type,
      isRead: updatedUserNotification.isRead,
      receivedAt: updatedUserNotification.receivedAt,
      createdAt: updatedUserNotification.notification.createdAt,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error updating notification:", error);
    return NextResponse.json(
      { error: "Failed to update notification" },
      { status: 500 }
    );
  }
}
