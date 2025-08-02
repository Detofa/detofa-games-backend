import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma.config";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

// Validate required environment variables
if (!GOOGLE_CLIENT_ID || !JWT_SECRET) {
  console.error("Missing required environment variables for Google OAuth");
  console.error("GOOGLE_CLIENT_ID:", !!GOOGLE_CLIENT_ID);
  console.error("JWT_SECRET:", !!JWT_SECRET);
}

export async function POST(req: NextRequest) {
  try {
    const { idToken } = await req.json();

    if (!idToken) {
      return NextResponse.json(
        { error: "ID token is required" },
        { status: 400 }
      );
    }

    // Verify the ID token with Google
    const tokenInfoResponse = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`
    );

    if (!tokenInfoResponse.ok) {
      console.error(
        "Token verification failed:",
        await tokenInfoResponse.text()
      );
      return NextResponse.json({ error: "Invalid ID token" }, { status: 401 });
    }

    const tokenInfo = await tokenInfoResponse.json();

    // Verify the token was issued for our app
    if (tokenInfo.aud !== GOOGLE_CLIENT_ID) {
      return NextResponse.json(
        { error: "Token was not issued for this application" },
        { status: 401 }
      );
    }

    // Extract user information from the token
    const { email, name, picture, sub: googleId } = tokenInfo;

    // Find or create user
    let user = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { googleId }],
      },
    });

    if (!user) {
      // Create new user
      user = await prisma.user.create({
        data: {
          email,
          name,
          googleId,
          imageUrl: picture,
          status: "USER",
        },
      });
    } else if (!user.googleId) {
      // Link existing email account with Google
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          googleId,
          imageUrl: picture || user.imageUrl,
          name: name || user.name,
        },
      });
    } else {
      // Update existing user's information
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          imageUrl: picture || user.imageUrl,
          name: name || user.name,
        },
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, status: user.status },
      JWT_SECRET,
      { expiresIn: "7200h" }
    );

    return NextResponse.json({
      message: "Google login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        status: user.status,
        imageUrl: user.imageUrl,
        account: user.account,
      },
    });
  } catch (error) {
    console.error("Google OAuth error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
