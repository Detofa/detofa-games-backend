import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma.config";
import { getUserIdFromRequest } from "@/app/lib/auth";

export async function DELETE(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "Missing or invalid token" },
      { status: 401 }
    );
  }

  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    const { cartItemId } = await req.json();
    if (!cartItemId) {
      return NextResponse.json(
        { error: "Missing cartItemId" },
        { status: 400 }
      );
    }
    // Ensure the cart item belongs to the user's cart
    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      return NextResponse.json(
        { error: "No cart found for user" },
        { status: 404 }
      );
    }
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
    });
    if (!cartItem || cartItem.cartId !== cart.id) {
      return NextResponse.json(
        { error: "Cart item not found in your cart" },
        { status: 404 }
      );
    }
    await prisma.cartItem.delete({ where: { id: cartItemId } });
    return NextResponse.json({ message: "Cart item removed" }, { status: 200 });
  } catch (error) {
    console.error("Remove cart item error:", error);
    return NextResponse.json(
      { error: "Failed to remove cart item" },
      { status: 500 }
    );
  }
}
