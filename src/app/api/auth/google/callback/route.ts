import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma.config";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@/app/api/utils/authConfig";
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
const REDIRECT_URI = `${BASE_URL}/api/auth/google/callback`;
const FRONTEND_URL = `${BASE_URL}/signin`;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const error = searchParams.get("error");
    const state = searchParams.get("state");

    if (error) {
      console.error("Google OAuth error:", error);
      return NextResponse.redirect(
        `${FRONTEND_URL}?error=google_oauth_failed&details=${error}`
      );
    }

    if (!code) {
      return NextResponse.redirect(
        `${FRONTEND_URL}?error=no_authorization_code`
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
      return NextResponse.redirect(
        `${FRONTEND_URL}?error=token_exchange_failed`
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
      return NextResponse.redirect(
        `${FRONTEND_URL}?error=profile_fetch_failed`
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

    // Redirect back to frontend with token and user data
    const redirectUrl = new URL(FRONTEND_URL);
    redirectUrl.searchParams.set("token", token);
    redirectUrl.searchParams.set(
      "user",
      JSON.stringify({
        id: user.id,
        name: user.name,
        email: user.email,
        status: user.status,
      })
    );
    redirectUrl.searchParams.set("success", "true");

    return NextResponse.redirect(redirectUrl.toString());
  } catch (error) {
    console.error("Google OAuth callback error:", error);
    return NextResponse.redirect(`${FRONTEND_URL}?error=internal_server_error`);
  }
}
