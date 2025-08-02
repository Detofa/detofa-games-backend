# Notification API Routes

This directory contains the API routes for managing user notifications.

## Routes

### GET /api/notifications
Get all notifications for the authenticated user.

**Authentication:** Required (Bearer token)
**Response:**
```json
[
  {
    "id": "notification-id",
    "title": "Notification Title",
    "body": "Notification body content",
    "type": "INFO",
    "isRead": false,
    "receivedAt": "2023-01-01T00:00:00.000Z",
    "createdAt": "2023-01-01T00:00:00.000Z"
  }
]
```

### POST /api/notifications
Create a new notification.

**Authentication:** Required (Bearer token)
**Request Body:**
```json
{
  "title": "Notification Title",
  "body": "Notification body content",
  "type": "INFO", // Optional
  "userIds": ["user-id-1", "user-id-2"] // Optional, if not provided, notification goes to requesting user
}
```

**Response:**
```json
{
  "message": "Notification created successfully",
  "notification": {
    "id": "notification-id",
    "title": "Notification Title",
    "body": "Notification body content",
    "type": "INFO",
    "recipients": 1
  }
}
```

### PUT /api/notifications/[id] or /api/notifications
Update a notification (mark as read, etc.).

**Authentication:** Required (Bearer token)

For URL parameter:
**URL:** `/api/notifications/[id]`
**Request Body:**
```json
{
  "isRead": true
}
```

For ID in body:
**URL:** `/api/notifications`
**Request Body:**
```json
{
  "id": "notification-id",
  "isRead": true
}
```

**Response:**
```json
{
  "id": "notification-id",
  "title": "Notification Title",
  "body": "Notification body content",
  "type": "INFO",
  "isRead": true,
  "receivedAt": "2023-01-01T00:00:00.000Z",
  "createdAt": "2023-01-01T00:00:00.000Z"
}
```

### DELETE /api/notifications/[id] or /api/notifications
Delete a notification for the user (removes the association between user and notification).

**Authentication:** Required (Bearer token)

For URL parameter:
**URL:** `/api/notifications/[id]`

For ID in body:
**URL:** `/api/notifications`
**Request Body:**
```json
{
  "id": "notification-id"
}
```

**Response:**
```json
{
  "message": "Notification deleted successfully"
}
```

### DELETE /api/notifications/[id]/admin
Delete a notification completely from the system (admin only).

**Authentication:** Required (Bearer token with admin privileges)
**Response:**
```json
{
  "message": "Notification deleted completely from the system"
}
