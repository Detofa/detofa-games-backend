import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/api/utils/prisma";
import { getUserIdFromRequest } from "@/app/lib/auth";

// GET /api/notifications/get - Get all notifications for the authenticated user
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
