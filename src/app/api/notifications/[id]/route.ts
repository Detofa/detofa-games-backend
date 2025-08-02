import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/api/utils/prisma";
import { getUserIdFromRequest } from "@/app/lib/auth";

// PUT /api/notifications/[id] - Update a notification (mark as read, etc.)
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const notificationId = params.id;

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

    // Parse request body
    const body = await req.json();
    const { isRead } = body;

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

// DELETE /api/notifications/[id] - Delete a notification for the user
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const notificationId = params.id;

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
