import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/api/utils/prisma";
import { getUserIdFromRequest } from "@/app/lib/auth";

// GET /api/notifications - Get all notifications for the authenticated user
export async function GET(req: NextRequest) {
  try {
    const userId = getUserIdFromRequest(req);

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized: Invalid or missing token" },
        { status: 401 }
      );
    }

    // Get all notifications for the user with read status
    const userNotifications = await prisma.userNotification.findMany({
      where: {
        userId: userId,
      },
      include: {
        notification: true,
      },
      orderBy: {
        notification: {
          createdAt: "desc",
        },
      },
    });

    // Transform the data to a more user-friendly format
    const notifications = userNotifications.map((userNotification) => ({
      id: userNotification.notification.id,
      title: userNotification.notification.title,
      body: userNotification.notification.body,
      type: userNotification.notification.type,
      isRead: userNotification.isRead,
      receivedAt: userNotification.receivedAt,
      createdAt: userNotification.notification.createdAt,
    }));

    return NextResponse.json(notifications, { status: 200 });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

// POST /api/notifications - Create a new notification
export async function POST(req: NextRequest) {
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
    const { title, body: notificationBody, type, userIds } = body;

    // Validate required fields
    if (!title || !notificationBody) {
      return NextResponse.json(
        { error: "Title and body are required" },
        { status: 400 }
      );
    }

    // Create the notification
    const notification = await prisma.notification.create({
      data: {
        title,
        body: notificationBody,
        type: type || null,
      },
    });

    // If userIds is provided, send to specific users, otherwise send to the requesting user
    const targetUserIds =
      userIds && Array.isArray(userIds) ? userIds : [userId];

    // Create user notifications for each target user
    const userNotifications = await Promise.all(
      targetUserIds.map(async (targetUserId) => {
        return prisma.userNotification.create({
          data: {
            userId: targetUserId,
            notificationId: notification.id,
            receivedAt: new Date(),
          },
        });
      })
    );

    return NextResponse.json(
      {
        message: "Notification created successfully",
        notification: {
          id: notification.id,
          title: notification.title,
          body: notification.body,
          type: notification.type,
          recipients: userNotifications.length,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating notification:", error);
    return NextResponse.json(
      { error: "Failed to create notification" },
      { status: 500 }
    );
  }
}

// PUT /api/notifications - Update a notification (mark as read, etc.) - ID in body
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

// DELETE /api/notifications - Delete a notification for the user - ID in body
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
