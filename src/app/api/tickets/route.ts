import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma.config";

export async function GET() {
  try {
    const tickets = await prisma.ticket.findMany();
    return NextResponse.json(tickets);
  } catch (error) {
    console.error("Error fetching tickets:", error);
    return NextResponse.json(
      { error: "Database connection failed. Please check DATABASE_URL." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    
    // Handle eventDate parsing if it's provided
    if (data.eventDate && typeof data.eventDate === 'string') {
      // If the date string doesn't include seconds, append :00
      if (data.eventDate.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)) {
        data.eventDate = new Date(data.eventDate + ':00');
      } else {
        data.eventDate = new Date(data.eventDate);
      }
    }
    
    const ticket = await prisma.ticket.create({
      data,
    });
    return NextResponse.json(ticket);
  } catch (error) {
    console.error("Error creating ticket:", error);
    return NextResponse.json(
      { error: "Failed to create ticket. Please check database connection." },
      { status: 500 }
    );
  }
}
