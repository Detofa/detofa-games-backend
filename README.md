# API Routes Documentation

This directory contains all the API routes for the frontend application. These routes act as a proxy to the backend API and provide a clean interface for the frontend components.

## Route Structure

### Authentication

- `POST /api/auth` - Handle login and registration
  - Body: `{ action: 'login' | 'register', ...userData }`

### Users

- `GET /api/users` - Get all users
- `POST /api/users` - Create new user

### Products

- `GET /api/products` - Get all products
- `POST /api/products` - Create new product
- `GET /api/products/[id]` - Get specific product
- `PUT /api/products/[id]` - Update specific product
- `DELETE /api/products/[id]` - Delete specific product

### Categories

- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create new category

### Videos

- `GET /api/videos` - Get all videos
- `POST /api/videos` - Create new video
- `GET /api/videos/[id]` - Get specific video
- `PUT /api/videos/[id]` - Update specific video
- `DELETE /api/videos/[id]` - Delete specific video

### Transactions

- `GET /api/transactions` - Get all transactions
- `POST /api/transactions` - Create new transaction
- `GET /api/transactions/[id]` - Get specific transaction
- `PUT /api/transactions/[id]` - Update specific transaction
- `DELETE /api/transactions/[id]` - Delete specific transaction

### Scores

- `GET /api/scores` - Get all scores
- `POST /api/scores` - Create new score
- `GET /api/scores/[id]` - Get specific score
- `PUT /api/scores/[id]` - Update specific score
- `DELETE /api/scores/[id]` - Delete specific score

## Usage Examples

### Frontend API Calls

```typescript
// Get all products
const products = await fetch("/api/products").then((res) => res.json());

// Create a product
const newProduct = await fetch("/api/products", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    name: "Gaming Headset",
    price: 99.99,
    categoryId: "1",
  }),
}).then((res) => res.json());

// Login user
const loginResult = await fetch("/api/auth", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    action: "login",
    email: "user@example.com",
    password: "password123",
  }),
}).then((res) => res.json());

// Get all videos
const videos = await fetch("/api/videos").then((res) => res.json());

// Create a transaction
const newTransaction = await fetch("/api/transactions", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    fromUserId: "user1",
    toUserId: "user2",
    amount: 100,
    note: "Payment for services",
  }),
}).then((res) => res.json());

// Submit a game score
const newScore = await fetch("/api/scores", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    userId: "user1",
    game: "SNAKE",
    score: 1500,
    times: 1,
  }),
}).then((res) => res.json());
```

## Error Handling

All API routes include proper error handling and return consistent error responses:

```typescript
// Success response
{ data: {...}, status: 200 }

// Error response
{ error: 'Error message', status: 400 }
```

## Environment Variables

- `NEXT_PUBLIC_API_URL` - Backend API base URL (defaults to `http://localhost:5000/api`)

## Utilities

The `utils/apiHelpers.ts` file provides helper functions for:

- `apiRequest()` - Make API requests to backend
- `createApiResponse()` - Create success responses
- `createErrorResponse()` - Create error responses

## Complete API Coverage

This frontend API structure now covers all the backend endpoints:

- ✅ Users (authentication, management)
- ✅ Products (e-commerce functionality)
- ✅ Categories (product organization)
- ✅ Videos (video content management)
- ✅ Transactions (financial operations)
- ✅ Scores (gaming functionality)

All routes support full CRUD operations where applicable and maintain consistent error handling and response formats.
