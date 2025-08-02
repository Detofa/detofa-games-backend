import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/api/utils/prisma";
import { getUserIdFromRequest } from "@/app/lib/auth";

// POST /api/notifications/create - Create a new notification
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
