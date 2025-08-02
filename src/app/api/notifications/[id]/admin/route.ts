import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/api/utils/prisma";
import { isAdmin } from "@/app/api/utils/authHelper";

// DELETE /api/notifications/[id]/admin - Delete a notification completely from the system (admin only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if user is admin
    const userIsAdmin = isAdmin(req);

    if (!userIsAdmin) {
      return NextResponse.json(
        { error: "Unauthorized: Admin access required" },
        { status: 403 }
      );
    }

    const notificationId = params.id;

    // Check if the notification exists
    const notification = await prisma.notification.findUnique({
      where: {
        id: notificationId,
      },
    });

    if (!notification) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      );
    }

    // Delete all user notifications associated with this notification
    await prisma.userNotification.deleteMany({
      where: {
        notificationId: notificationId,
      },
    });

    // Delete the notification itself
    await prisma.notification.delete({
      where: {
        id: notificationId,
      },
    });

    return NextResponse.json(
      { message: "Notification deleted completely from the system" },
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
