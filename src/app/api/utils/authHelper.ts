import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";
import { UserStatus } from "@prisma/client";
import { JWT_SECRET } from "./authConfig";

// Re-export UserStatus from Prisma for convenience
export { UserStatus };

// Type definitions for JWT payload
export interface JWTPayload {
  userId: string;
  status?: UserStatus | string;
}

export interface DecodedToken extends JWTPayload {
  iat?: number;
  exp?: number;
}

/**
 * Verify JWT token and return decoded payload
 * @param request - NextRequest object
 * @returns Decoded token payload or null if invalid
 */
export function verifyToken(request: NextRequest): DecodedToken | null {
  const authHeader = request.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
    return decoded;
  } catch (error) {
    console.error("JWT verification failed:", error);
    return null;
  }
}

/**
 * Get user status from JWT token
 * @param request - NextRequest object
 * @returns User status (UserStatus enum value) or null if not found/invalid
 */
export function getUserStatus(request: NextRequest): UserStatus | string | null {
  const decoded = verifyToken(request);
  return decoded?.status || null;
}

/**
 * Check if a status string represents an admin role
 * Admin roles: ADMIN, SNAKEADMIN, TETRISADMIN, FLAPPYBIRDADMIN
 * @param status - User status string
 * @returns true if status is an admin role
 */
export function isAdminStatus(status: string | null | undefined): boolean {
  if (!status || typeof status !== "string") return false;
  
  return (
    status === UserStatus.ADMIN ||
    status === UserStatus.SNAKEADMIN ||
    status === UserStatus.TETRISADMIN ||
    status === UserStatus.FLAPPYBIRDADMIN ||
    status.endsWith("ADMIN")
  );
}

/**
 * Check if user has admin status (ADMIN or ends with ADMIN)
 * Admin roles: ADMIN, SNAKEADMIN, TETRISADMIN, FLAPPYBIRDADMIN
 * @param request - NextRequest object
 * @returns true if user is admin, false otherwise
 */
export function isAdmin(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    if (process.env.NODE_ENV === "development") {
      console.log("isAdmin: No authorization header or invalid format");
    }
    return false;
  }

  const token = authHeader.split(" ")[1];
  
  if (!JWT_SECRET) {
    console.error("isAdmin: JWT_SECRET is not set");
    return false;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
    const status = decoded.status;
    
    if (process.env.NODE_ENV === "development") {
      console.log("isAdmin: Decoded token status:", status, "userId:", decoded.userId);
    }
    
    const isAdminUser = isAdminStatus(status);
    
    if (process.env.NODE_ENV === "development") {
      console.log("isAdmin: Result:", isAdminUser);
    }
    
    return isAdminUser;
  } catch (error) {
    console.error("JWT admin check failed:", error);
    return false;
  }
}

/**
 * Check if user has staff status (STAFF or admin roles)
 * @param request - NextRequest object
 * @returns true if user is staff or admin
 */
export function isStaff(request: NextRequest): boolean {
  const status = getUserStatus(request);
  return status === UserStatus.STAFF || isAdminStatus(status);
}

/**
 * Check if user has a specific status
 * @param request - NextRequest object
 * @param targetStatus - Status to check for
 * @returns true if user has the target status
 */
export function hasStatus(
  request: NextRequest,
  targetStatus: UserStatus | string
): boolean {
  const status = getUserStatus(request);
  return status === targetStatus;
}

/**
 * Check if user has any of the specified statuses
 * @param request - NextRequest object
 * @param allowedStatuses - Array of allowed statuses
 * @returns true if user has one of the allowed statuses
 */
export function hasAnyStatus(
  request: NextRequest,
  allowedStatuses: (UserStatus | string)[]
): boolean {
  const status = getUserStatus(request);
  if (!status) return false;
  return allowedStatuses.includes(status);
}
