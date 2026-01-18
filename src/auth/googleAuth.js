import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists
        let user = await prisma.user.findUnique({
          where: { email: profile.emails[0].value },
        });

        if (!user) {
          // Create new user
          user = await prisma.user.create({
            data: {
              email: profile.emails[0].value,
              name: profile.displayName,
              // You can add more fields here if needed
            },
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// Serialize user to session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Middleware to initialize passport
export const initializePassport = () => {
  return passport.initialize();
};

// Middleware to authenticate with Google
export const authenticateGoogle = passport.authenticate("google", {
  scope: ["profile", "email"],
});

// Middleware for Google callback
export const googleCallback = (req, res, next) => {
  passport.authenticate("google", { session: false }, (err, user, info) => {
    if (err || !user) {
      return res.status(401).json({ message: "Authentication failed" });
    }
    // Generate JWT token with userId and status (consistent with other auth routes)
    const token = jwt.sign(
      { userId: user.id, status: user.status || "USER" },
      process.env.JWT_SECRET || process.env.NEXT_PUBLIC_JWT_SECRET || "your-secret-key",
      {
        expiresIn: "7200h", // Consistent with other auth routes
      }
    );
    // Send token to client or redirect as needed
    res.json({ token, user });
  })(req, res, next);
};
