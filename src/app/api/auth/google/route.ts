import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma.config";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
const REDIRECT_URI = `${BASE_URL}/api/auth/google/callback`;

// Validate required environment variables
if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !JWT_SECRET) {
  console.error("Missing required environment variables for Google OAuth");
  console.error("GOOGLE_CLIENT_ID:", !!GOOGLE_CLIENT_ID);
  console.error("GOOGLE_CLIENT_SECRET:", !!GOOGLE_CLIENT_SECRET);
  console.error("JWT_SECRET:", !!JWT_SECRET);
  console.error("BASE_URL:", BASE_URL);
}

// Step 1: Initiate Google OAuth flow
export async function GET(req: NextRequest) {
  try {
    // Check if required environment variables are set
    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
      console.error("Google OAuth environment variables not configured");
      return NextResponse.json(
        { error: "Google OAuth not configured" },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(req.url);
    const state = searchParams.get("state") || "default";

    const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    authUrl.searchParams.set("client_id", GOOGLE_CLIENT_ID);
    authUrl.searchParams.set("redirect_uri", REDIRECT_URI);
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("scope", "profile email");
    authUrl.searchParams.set("state", state);
    authUrl.searchParams.set("access_type", "offline");

    console.log("Redirecting to Google OAuth with URI:", REDIRECT_URI);
    return NextResponse.redirect(authUrl.toString());
  } catch (error) {
    console.error("Google OAuth initiation error:", error);
    return NextResponse.json(
      { error: "Failed to initiate Google OAuth" },
      { status: 500 }
    );
  }
}

// Step 2: Handle OAuth callback and token exchange
export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json();

    if (!code) {
      return NextResponse.json(
        { error: "Authorization code is required" },
        { status: 400 }
      );
    }

    // Exchange authorization code for access token
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID!,
        client_secret: GOOGLE_CLIENT_SECRET!,
        code,
        grant_type: "authorization_code",
        redirect_uri: REDIRECT_URI,
      }),
    });

    if (!tokenResponse.ok) {
      console.error("Token exchange failed:", await tokenResponse.text());
      return NextResponse.json(
        { error: "Failed to exchange authorization code" },
        { status: 400 }
      );
    }

    const tokenData = await tokenResponse.json();
    const { access_token } = tokenData;

    // Get user profile from Google
    const profileResponse = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    if (!profileResponse.ok) {
      return NextResponse.json(
        { error: "Failed to fetch user profile" },
        { status: 400 }
      );
    }

    const profile = await profileResponse.json();

    // Find or create user
    let user = await prisma.user.findFirst({
      where: {
        OR: [{ email: profile.email }, { googleId: profile.id }],
      },
    });

    if (!user) {
      // Create new user
      user = await prisma.user.create({
        data: {
          email: profile.email,
          name: profile.name,
          googleId: profile.id,
          status: "USER",
        },
      });
    } else if (!user.googleId) {
      // Link existing email account with Google
      user = await prisma.user.update({
        where: { id: user.id },
        data: { googleId: profile.id },
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
