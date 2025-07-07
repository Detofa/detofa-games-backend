const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
}

export interface UserInfo {
  userId: string;
  email: string;
  role: string;
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  token?: string
): Promise<ApiResponse<T>> {
  try {
    const url = `${API_BASE_URL}${endpoint}`;

    // Prepare headers
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    // Add authorization header if token is provided
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      headers,
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        error: data.message || `Request failed with status ${response.status}`,
        status: response.status,
      };
    }

    return {
      data,
      status: response.status,
    };
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    return {
      error: "Network error or server unavailable",
      status: 500,
    };
  }
}

export function createApiResponse<T>(data: T, status: number = 200): Response {
  return Response.json(data, { status });
}

export function createErrorResponse(
  error: string,
  status: number = 500
): Response {
  return Response.json({ error }, { status });
}

// Helper function to extract token from request headers
export function getTokenFromRequest(request: Request): string | null {
  const authHeader = request.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }
  return null;
}

// Helper function to extract user information from request headers
export function getUserInfoFromRequest(request: Request): UserInfo | null {
  const userId = request.headers.get("X-User-ID");
  const email = request.headers.get("X-User-Email");
  const role = request.headers.get("X-User-Role");

  if (!userId) {
    return null;
  }

  return {
    userId,
    email: email || "",
    role: role || "",
  };
}

// Helper function to check if user has required role
export function hasRole(
  userInfo: UserInfo | null,
  requiredRole: string
): boolean {
  if (!userInfo) return false;
  return userInfo.role === requiredRole || userInfo.role === "ADMIN";
}
