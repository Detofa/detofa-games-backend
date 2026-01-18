/**
 * Centralized authentication configuration
 * This ensures consistent JWT_SECRET usage across all auth operations
 */

// Use the same JWT secret everywhere so tokens issued on login
// are verified correctly across all auth operations
export const JWT_SECRET =
  process.env.JWT_SECRET ||
  process.env.NEXT_PUBLIC_JWT_SECRET ||
  "your-secret-key";

// Check if JWT_SECRET is properly configured
if (!process.env.JWT_SECRET && process.env.NODE_ENV === "production") {
  console.warn(
    "WARNING: JWT_SECRET is not set in environment variables. Using fallback secret."
  );
}

