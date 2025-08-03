import { NextRequest } from "next/server";
import prisma from "@/app/lib/prisma.config";

// In-memory event store for demo (replace with Redis or DB pub/sub for production)
const sessionEvents: Record<string, string[]> = {};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: sessionId } = await params;
  if (!sessionId) {
    return new Response("Session ID required", { status: 400 });
  }
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      let lastEventCount = 0;
      while (true) {
        // Check for new events
        const events = sessionEvents[sessionId] || [];
        if (events.length > lastEventCount) {
          for (let i = lastEventCount; i < events.length; i++) {
            controller.enqueue(encoder.encode(`data: ${events[i]}\n\n`));
          }
          lastEventCount = events.length;
        }
        await new Promise((res) => setTimeout(res, 2000)); // Poll every 2s
      }
    },
    cancel() {},
  });
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

// Helper to push events (call this from other endpoints after key actions)
function pushSessionEvent(sessionId: string, event: string) {
  if (!sessionEvents[sessionId]) sessionEvents[sessionId] = [];
  sessionEvents[sessionId].push(event);
}
