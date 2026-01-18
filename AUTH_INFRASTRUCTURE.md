# Authentication Infrastructure Documentation

## Overview
This document describes the authentication infrastructure improvements made to ensure consistent `user.status` checking across the application.

**Important**: All UserStatus types are imported directly from `@prisma/client` to ensure they stay in sync with the Prisma schema. Any changes to the UserStatus enum in `prisma/schema.prisma` will automatically be reflected in the authentication helpers.

## Key Changes

### 1. Centralized JWT Configuration
- **File**: `src/app/api/utils/authConfig.ts`
- **Purpose**: Single source of truth for JWT_SECRET
- **Benefits**: 
  - Prevents JWT_SECRET mismatches between token creation and verification
  - Ensures consistent secret usage across all auth operations
  - Provides fallback values for development

### 2. Enhanced Auth Helper Functions
- **File**: `src/app/api/utils/authHelper.ts`
- **Uses Prisma Types**: Imports `UserStatus` directly from `@prisma/client` for type safety
- **Functions**:
  - `verifyToken()`: Verifies JWT and returns decoded payload with TypeScript types
  - `getUserStatus()`: Extracts user status from token (returns UserStatus enum)
  - `isAdmin()`: Checks if user has admin privileges (ADMIN or *ADMIN status)
  - `isStaff()`: Checks if user is staff or admin
  - `hasStatus()`: Checks for specific status
  - `hasAnyStatus()`: Checks if user has any of multiple statuses
  - `isAdminStatus()`: Utility to check if a status string is admin

### 3. Standardized Token Creation
All JWT token creation points now include `status` field:
- ✅ `src/app/api/users/login/route.ts`
- ✅ `src/app/api/auth/google/token/route.ts`
- ✅ `src/app/api/auth/google/route.ts`
- ✅ `src/app/api/auth/google/callback/route.ts`
- ✅ `src/app/api/auth/google/mobile/route.ts`
- ✅ `src/auth/googleAuth.js`

**Token Format**: `{ userId: string, status: string }`

### 4. Updated Files Using JWT_SECRET
All files now import from centralized config:
- ✅ `src/app/api/utils/authHelper.ts`
- ✅ `src/app/api/users/login/route.ts`
- ✅ `src/app/api/auth/google/*/route.ts` (all variants)
- ✅ `src/app/lib/auth.ts`
- ✅ `src/app/api/utils/authUtils.js`
- ✅ `middleware.ts`

## User Status Enum

All user statuses are imported from Prisma schema (`@prisma/client`):
- `USER` - Regular user (default, as per schema: `@default(USER)`)
- `ADMIN` - Full admin access
- `STAFF` - Staff member
- `FILEDTEAM` - Field team member
- `SNAKEADMIN` - Snake game admin
- `TETRISADMIN` - Tetris game admin
- `FLAPPYBIRDADMIN` - Flappy Bird game admin

**Schema Reference**: `prisma/schema.prisma` lines 28-36
```prisma
enum UserStatus {
  USER
  ADMIN
  STAFF
  FILEDTEAM
  SNAKEADMIN
  TETRISADMIN
  FLAPPYBIRDADMIN
}
```

**Default Status**: New users default to `USER` status (as defined in schema line 50: `status UserStatus @default(USER)`)

## Admin Status Check Logic

The `isAdmin()` function checks for admin status using:
1. **Exact match**: `status === "ADMIN"`
2. **Specific admin roles**: `SNAKEADMIN`, `TETRISADMIN`, `FLAPPYBIRDADMIN`
3. **Suffix match**: `status.endsWith("ADMIN")` (for future admin roles)

**Admin Statuses** (have full admin access):
- `ADMIN` - Full admin
- `SNAKEADMIN` - Snake game admin
- `TETRISADMIN` - Tetris game admin
- `FLAPPYBIRDADMIN` - Flappy Bird game admin

**Non-Admin Statuses** (no admin access):
- `USER` - Regular user
- `STAFF` - Staff member
- `FILEDTEAM` - Field team member

## Debug Logging

Debug logging is now conditional:
- **Development**: Full logging enabled
- **Production**: Only error logging enabled

## Best Practices

### When Creating Tokens
Always include `status` field:
```typescript
const token = jwt.sign(
  { userId: user.id, status: user.status },
  JWT_SECRET,
  { expiresIn: "7200h" }
);
```

### When Checking Admin Access
Use the centralized helper:
```typescript
import { isAdmin } from "@/app/api/utils/authHelper";

if (!isAdmin(request)) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
```

### When Checking Staff Access
Use the staff helper (includes admins):
```typescript
import { isStaff } from "@/app/api/utils/authHelper";

if (!isStaff(request)) {
  return NextResponse.json({ error: "Staff access required" }, { status: 403 });
}
```

### When Getting User Status
Use the helper function:
```typescript
import { getUserStatus, UserStatus } from "@/app/api/utils/authHelper";

const status = getUserStatus(request);
if (status === UserStatus.ADMIN) {
  // Admin logic
}
```

### When Checking Specific Status
Use the hasStatus helper:
```typescript
import { hasStatus, UserStatus } from "@/app/api/utils/authHelper";

if (hasStatus(request, UserStatus.STAFF)) {
  // Staff-specific logic
}
```

### When Checking Multiple Statuses
Use the hasAnyStatus helper:
```typescript
import { hasAnyStatus, UserStatus } from "@/app/api/utils/authHelper";

if (hasAnyStatus(request, [UserStatus.ADMIN, UserStatus.STAFF])) {
  // Admin or Staff logic
}
```

### Available Helper Functions
- `isAdmin(request)` - Checks if user is admin (ADMIN or *ADMIN)
- `isStaff(request)` - Checks if user is staff or admin
- `getUserStatus(request)` - Gets user status from token
- `hasStatus(request, status)` - Checks for specific status
- `hasAnyStatus(request, statuses[])` - Checks if user has any of the specified statuses
- `isAdminStatus(status)` - Utility function to check if a status string is admin

## Testing Checklist

- [x] All token creation points include `status` field
- [x] All JWT_SECRET usage is centralized
- [x] Admin check works for ADMIN status
- [x] Admin check works for *ADMIN statuses
- [x] Debug logging is conditional
- [x] TypeScript types are defined for JWT payload

## Future Improvements

1. Consider adding role-based access control (RBAC) helpers
2. Add token refresh mechanism
3. Add rate limiting for auth endpoints
4. Consider adding audit logging for admin actions

