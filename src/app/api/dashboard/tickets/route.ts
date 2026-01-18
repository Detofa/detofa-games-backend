import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma.config";
import { isAdmin } from "@/app/api/utils/authHelper";

export async function GET(req: NextRequest) {
  if (!isAdmin(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const tickets = await prisma.ticket.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        purchases: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            },
            payment: true
          }
        }
      }
    });
    return NextResponse.json(tickets);
  } catch (error: any) {
    console.error("Error fetching tickets:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch tickets" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const data = await req.json();
    const {
      title,
      description,
      price,
      currency = "CDF",
      totalQuantity,
      eventDate,
      location
    } = data;

    if (!title || !price || !totalQuantity) {
      return NextResponse.json(
        { error: "Missing required fields: title, price, totalQuantity" },
        { status: 400 }
      );
    }

    const ticket = await prisma.ticket.create({
      data: {
        title,
        description,
        price: parseFloat(price),
        currency,
        totalQuantity: parseInt(totalQuantity),
        soldQuantity: 0,
        eventDate: eventDate ? new Date(eventDate) : null,
        location,
        status: "ACTIVE"
      }
    });

    return NextResponse.json(ticket);
  } catch (error: any) {
    console.error("Error creating ticket:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create ticket" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  if (!isAdmin(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const data = await req.json();
    const { id, ...updateData } = data;

    if (!id) {
      return NextResponse.json(
        { error: "Ticket ID is required" },
        { status: 400 }
      );
    }

    const ticket = await prisma.ticket.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json(ticket);
  } catch (error: any) {
    console.error("Error updating ticket:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update ticket" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  if (!isAdmin(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Ticket ID is required" },
        { status: 400 }
      );
    }

    await prisma.ticket.delete({
      where: { id }
    });

    return NextResponse.json({ message: "Ticket deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting ticket:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete ticket" },
      { status: 500 }
    );
  }
}
