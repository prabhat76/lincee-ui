# LINCEE API - Complete Request/Response Documentation

## Overview
All API endpoints are accessible at `http://localhost:8080/api/v1`
All requests require `Content-Type: application/json` header
All authenticated requests require `Authorization: Bearer {token}` header

---

## 🔐 Authentication APIs

### 1. User Login
**Request:**
```
POST /auth/login
Content-Type: application/json

{
  "username": "string (required, min 3 chars)",
  "password": "string (required, min 6 chars)"
}
```

**Success Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": 1,
  "username": "johndoe",
  "email": "john@example.com"
}
```

**Error Response (400):**
```json
{
  "error": "Invalid credentials",
  "message": "Username or password is incorrect"
}
```

**Error Response (401):**
```json
{
  "error": "Unauthorized",
  "message": "Invalid username or password"
}
```

---

### 2. User Registration
**Request:**
```
POST /auth/register
Content-Type: application/json

{
  "username": "string (required, min 3 chars, unique)",
  "email": "string (required, valid email, unique)",
  "password": "string (required, min 6 chars)",
  "firstName": "string (optional)",
  "lastName": "string (optional)",
  "phoneNumber": "string (optional)"
}
```

**Success Response (201):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": 2,
  "username": "janedoe",
  "email": "jane@example.com",
  "message": "User registered successfully"
}
```

**Error Response (400):**
```json
{
  "error": "Validation Failed",
  "message": "Username already exists",
  "errors": {
    "username": "Username must be unique"
  }
}
```

---

### 3. User Logout
**Request:**
```
POST /auth/logout
Authorization: Bearer {token}
Content-Type: application/json

{}
```

**Success Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

---

### 4. Refresh Token
**Request:**
```
POST /auth/refresh
Authorization: Bearer {token}
Content-Type: application/json

{}
```

**Success Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "Token refreshed successfully"
}
```

---

## 👥 User Management APIs

### 1. Get All Users (Admin)
**Request:**
```
GET /users?page=0&size=20&sort=id,desc
Authorization: Bearer {token}
```

**Success Response (200):**
```json
{
  "content": [
    {
      "id": 1,
      "username": "johndoe",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "phoneNumber": "+1234567890",
      "role": "CUSTOMER",
      "createdAt": "2026-02-03T10:30:00Z",
      "updatedAt": "2026-02-03T10:30:00Z"
    }
  ],
  "totalElements": 100,
  "totalPages": 5,
  "currentPage": 0,
  "pageSize": 20
}
```

---

### 2. Get User by ID
**Request:**
```
GET /users/{id}
Authorization: Bearer {token}
```

**Success Response (200):**
```json
{
  "id": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+1234567890",
  "role": "CUSTOMER",
  "createdAt": "2026-02-03T10:30:00Z",
  "updatedAt": "2026-02-03T10:30:00Z"
}
```

**Error Response (404):**
```json
{
  "error": "Not Found",
  "message": "User with id 999 not found"
}
```

---

### 3. Create User (Admin)
**Request:**
```
POST /users
Authorization: Bearer {token}
Content-Type: application/json

{
  "username": "newuser",
  "email": "newuser@example.com",
  "password": "password123",
  "firstName": "New",
  "lastName": "User",
  "phoneNumber": "+1234567890"
}
```

**Success Response (201):**
```json
{
  "id": 3,
  "username": "newuser",
  "email": "newuser@example.com",
  "firstName": "New",
  "lastName": "User",
  "phoneNumber": "+1234567890",
  "role": "CUSTOMER",
  "createdAt": "2026-02-03T10:30:00Z"
}
```

---

### 4. Update User
**Request:**
```
PUT /users/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "firstName": "Jonathan",
  "lastName": "Doe Updated",
  "phoneNumber": "+1234567891"
}
```

**Success Response (200):**
```json
{
  "id": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "firstName": "Jonathan",
  "lastName": "Doe Updated",
  "phoneNumber": "+1234567891",
  "role": "CUSTOMER",
  "updatedAt": "2026-02-03T11:30:00Z"
}
```

---

### 5. Delete User (Admin)
**Request:**
```
DELETE /users/{id}
Authorization: Bearer {token}
```

**Success Response (204):**
```
(No content)
```

---

### 6. Search Users
**Request:**
```
GET /users/search?email=john@example.com
Authorization: Bearer {token}
```

**Success Response (200):**
```json
{
  "content": [
    {
      "id": 1,
      "username": "johndoe",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe"
    }
  ],
  "totalElements": 1
}
```

---

## 🛍️ Product APIs

### 1. Get All Products (Paginated)
**Request:**
```
GET /products?page=0&size=20&sort=id,desc
```

**Success Response (200):**
```json
{
  "content": [
    {
      "id": 1,
      "name": "Urban Shirt",
      "description": "High-quality cotton shirt perfect for casual wear",
      "price": 49.99,
      "category": "CLOTHING",
      "brand": "LINCEE",
      "stockQuantity": 100,
      "imageUrls": [
        "https://example.com/image1.jpg",
        "https://example.com/image2.jpg"
      ],
      "availableSizes": ["XS", "S", "M", "L", "XL", "XXL"],
      "availableColors": ["Black", "White", "Navy"],
      "isActive": true,
      "isFeatured": true,
      "rating": 4.5,
      "reviewCount": 23,
      "createdAt": "2026-01-15T08:00:00Z"
    }
  ],
  "totalElements": 250,
  "totalPages": 13,
  "currentPage": 0,
  "pageSize": 20
}
```

---

### 2. Get Product by ID
**Request:**
```
GET /products/{id}
```

**Success Response (200):**
```json
{
  "id": 1,
  "name": "Urban Shirt",
  "description": "High-quality cotton shirt perfect for casual wear",
  "price": 49.99,
  "category": "CLOTHING",
  "brand": "LINCEE",
  "stockQuantity": 100,
  "imageUrls": ["https://example.com/image1.jpg"],
  "availableSizes": ["XS", "S", "M", "L", "XL", "XXL"],
  "availableColors": ["Black", "White", "Navy"],
  "isActive": true,
  "isFeatured": true,
  "rating": 4.5,
  "reviewCount": 23
}
```

---

### 3. Get Featured Products
**Request:**
```
GET /products/featured?limit=10
```

**Success Response (200):**
```json
{
  "content": [
    {
      "id": 1,
      "name": "Urban Shirt",
      "price": 49.99,
      "imageUrls": ["https://example.com/image1.jpg"],
      "isFeatured": true,
      "rating": 4.5
    }
  ],
  "totalElements": 15
}
```

---

### 4. Get Products by Category
**Request:**
```
GET /products/category/CLOTHING?page=0&size=20
```

**Success Response (200):**
```json
{
  "content": [
    {
      "id": 1,
      "name": "Urban Shirt",
      "category": "CLOTHING",
      "price": 49.99,
      "stockQuantity": 100
    }
  ],
  "totalElements": 45,
  "totalPages": 3
}
```

---

### 5. Search Products
**Request:**
```
GET /products/search?keyword=shirt&page=0&size=20
```

**Success Response (200):**
```json
{
  "content": [
    {
      "id": 1,
      "name": "Urban Shirt",
      "description": "High-quality cotton shirt...",
      "price": 49.99,
      "imageUrls": ["https://example.com/image1.jpg"]
    }
  ],
  "totalElements": 5,
  "totalPages": 1
}
```

---

### 6. Create Product (Admin)
**Request:**
```
POST /products
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "New Product",
  "description": "Product description",
  "price": 99.99,
  "category": "CLOTHING",
  "brand": "LINCEE",
  "stockQuantity": 50,
  "availableSizes": ["S", "M", "L"],
  "availableColors": ["Black", "White"],
  "isActive": true,
  "isFeatured": false
}
```

**Success Response (201):**
```json
{
  "id": 251,
  "name": "New Product",
  "price": 99.99,
  "createdAt": "2026-02-03T12:00:00Z"
}
```

---

### 7. Update Product (Admin)
**Request:**
```
PUT /products/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Updated Product Name",
  "price": 79.99,
  "stockQuantity": 45
}
```

**Success Response (200):**
```json
{
  "id": 1,
  "name": "Updated Product Name",
  "price": 79.99,
  "stockQuantity": 45,
  "updatedAt": "2026-02-03T12:05:00Z"
}
```

---

### 8. Update Product Stock
**Request:**
```
PATCH /products/{id}/stock
Authorization: Bearer {token}
Content-Type: application/json

{
  "quantity": 95
}
```

**Success Response (200):**
```json
{
  "id": 1,
  "stockQuantity": 95,
  "message": "Stock updated successfully"
}
```

---

### 9. Delete Product (Admin)
**Request:**
```
DELETE /products/{id}
Authorization: Bearer {token}
```

**Success Response (204):**
```
(No content)
```

---

## 🛒 Shopping Cart APIs

### 1. Get or Create User Cart
**Request:**
```
GET /cart/user/{userId}
Authorization: Bearer {token}
```

**Success Response (200):**
```json
{
  "id": 1,
  "userId": 1,
  "items": [
    {
      "id": 101,
      "productId": 1,
      "quantity": 2,
      "size": "M",
      "price": 49.99,
      "subtotal": 99.98
    }
  ],
  "totalAmount": 99.98,
  "itemCount": 2,
  "createdAt": "2026-02-03T10:00:00Z",
  "updatedAt": "2026-02-03T10:00:00Z"
}
```

---

### 2. Add Item to Cart
**Request:**
```
POST /cart/user/{userId}/items
Authorization: Bearer {token}
Content-Type: application/json

{
  "productId": 1,
  "quantity": 2,
  "size": "M"
}
```

**Success Response (201):**
```json
{
  "id": 101,
  "cartId": 1,
  "productId": 1,
  "quantity": 2,
  "size": "M",
  "price": 49.99,
  "subtotal": 99.98
}
```

---

### 3. Update Cart Item Quantity
**Request:**
```
PUT /cart/items/{cartItemId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "quantity": 3
}
```

**Success Response (200):**
```json
{
  "id": 101,
  "quantity": 3,
  "subtotal": 149.97,
  "message": "Cart item updated successfully"
}
```

---

### 4. Remove Cart Item
**Request:**
```
DELETE /cart/user/{userId}/items/{cartItemId}
Authorization: Bearer {token}
```

**Success Response (204):**
```
(No content)
```

---

### 5. Get All Cart Items
**Request:**
```
GET /cart/user/{userId}/items
Authorization: Bearer {token}
```

**Success Response (200):**
```json
{
  "items": [
    {
      "id": 101,
      "productId": 1,
      "productName": "Urban Shirt",
      "quantity": 2,
      "size": "M",
      "price": 49.99,
      "subtotal": 99.98,
      "imageUrl": "https://example.com/image.jpg"
    }
  ],
  "totalAmount": 99.98,
  "itemCount": 2
}
```

---

### 6. Clear Cart
**Request:**
```
DELETE /cart/user/{userId}/clear
Authorization: Bearer {token}
```

**Success Response (204):**
```
(No content)
```

---

## 📦 Order APIs

### 1. Create Order
**Request:**
```
POST /orders
Authorization: Bearer {token}
Content-Type: application/json

{
  "userId": 1,
  "shippingAddressId": 5,
  "billingAddressId": 5,
  "paymentMethodId": 10,
  "items": [
    {
      "productId": 1,
      "quantity": 2,
      "size": "M"
    }
  ],
  "shippingMethod": "STANDARD",
  "notes": "Please deliver in evening"
}
```

**Success Response (201):**
```json
{
  "id": 1001,
  "orderNumber": "ORD-2026-02-001",
  "userId": 1,
  "totalAmount": 129.99,
  "shippingCost": 10.00,
  "tax": 20.00,
  "status": "PENDING",
  "createdAt": "2026-02-03T12:30:00Z"
}
```

---

### 2. Get Order by ID
**Request:**
```
GET /orders/{id}
Authorization: Bearer {token}
```

**Success Response (200):**
```json
{
  "id": 1001,
  "orderNumber": "ORD-2026-02-001",
  "userId": 1,
  "status": "SHIPPED",
  "totalAmount": 129.99,
  "items": [
    {
      "id": 5001,
      "productId": 1,
      "productName": "Urban Shirt",
      "quantity": 2,
      "price": 49.99
    }
  ],
  "shippingAddress": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001"
  },
  "trackingNumber": "TRK123456789",
  "estimatedDelivery": "2026-02-10T00:00:00Z",
  "createdAt": "2026-02-03T12:30:00Z"
}
```

---

### 3. Get User Orders
**Request:**
```
GET /orders/user/{userId}?page=0&size=10&sort=createdAt,desc
Authorization: Bearer {token}
```

**Success Response (200):**
```json
{
  "content": [
    {
      "id": 1001,
      "orderNumber": "ORD-2026-02-001",
      "status": "SHIPPED",
      "totalAmount": 129.99,
      "createdAt": "2026-02-03T12:30:00Z"
    }
  ],
  "totalElements": 5,
  "totalPages": 1,
  "currentPage": 0
}
```

---

### 4. Update Order Status
**Request:**
```
PATCH /orders/{id}/status
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "SHIPPED",
  "trackingNumber": "TRK123456789"
}
```

**Success Response (200):**
```json
{
  "id": 1001,
  "status": "SHIPPED",
  "trackingNumber": "TRK123456789",
  "message": "Order status updated successfully"
}
```

---

## 💳 Payment APIs

### 1. Create Payment
**Request:**
```
POST /payments?orderId=1001
Authorization: Bearer {token}
Content-Type: application/json

{
  "amount": 129.99,
  "paymentMethod": "CREDIT_CARD",
  "cardNumber": "4111111111111111",
  "expiryMonth": 12,
  "expiryYear": 2027,
  "cvv": "123"
}
```

**Success Response (201):**
```json
{
  "id": 2001,
  "orderId": 1001,
  "amount": 129.99,
  "paymentMethod": "CREDIT_CARD",
  "status": "PENDING",
  "transactionId": "TXN-2026-02-001",
  "createdAt": "2026-02-03T12:35:00Z"
}
```

---

### 2. Get Payment by Order ID
**Request:**
```
GET /payments/order/{orderId}
Authorization: Bearer {token}
```

**Success Response (200):**
```json
{
  "id": 2001,
  "orderId": 1001,
  "amount": 129.99,
  "paymentMethod": "CREDIT_CARD",
  "status": "COMPLETED",
  "transactionId": "TXN-2026-02-001",
  "completedAt": "2026-02-03T12:36:00Z"
}
```

---

### 3. Update Payment Status
**Request:**
```
PATCH /payments/{id}/status
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "COMPLETED"
}
```

**Success Response (200):**
```json
{
  "id": 2001,
  "status": "COMPLETED",
  "message": "Payment status updated successfully"
}
```

---

## 📍 Address APIs

### 1. Add Address
**Request:**
```
POST /addresses
Authorization: Bearer {token}
Content-Type: application/json

{
  "userId": 1,
  "type": "SHIPPING",
  "street": "123 Main Street",
  "city": "New York",
  "state": "NY",
  "zipCode": "10001",
  "country": "USA",
  "phoneNumber": "+1234567890",
  "isDefault": true
}
```

**Success Response (201):**
```json
{
  "id": 5,
  "userId": 1,
  "type": "SHIPPING",
  "street": "123 Main Street",
  "city": "New York",
  "state": "NY",
  "zipCode": "10001",
  "country": "USA",
  "isDefault": true,
  "createdAt": "2026-02-03T12:40:00Z"
}
```

---

### 2. Get User Addresses
**Request:**
```
GET /addresses/user/{userId}
Authorization: Bearer {token}
```

**Success Response (200):**
```json
{
  "addresses": [
    {
      "id": 5,
      "type": "SHIPPING",
      "street": "123 Main Street",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001",
      "isDefault": true
    }
  ],
  "totalElements": 2
}
```

---

## ⭐ Review APIs

### 1. Add Review
**Request:**
```
POST /reviews
Authorization: Bearer {token}
Content-Type: application/json

{
  "productId": 1,
  "rating": 5,
  "title": "Excellent Product!",
  "comment": "Great quality and very comfortable"
}
```

**Success Response (201):**
```json
{
  "id": 301,
  "productId": 1,
  "userId": 1,
  "rating": 5,
  "title": "Excellent Product!",
  "comment": "Great quality and very comfortable",
  "helpfulCount": 0,
  "createdAt": "2026-02-03T12:45:00Z"
}
```

---

### 2. Get Product Reviews
**Request:**
```
GET /reviews/product/{productId}?page=0&size=10&sort=createdAt,desc
```

**Success Response (200):**
```json
{
  "content": [
    {
      "id": 301,
      "userId": 1,
      "userName": "johndoe",
      "rating": 5,
      "title": "Excellent Product!",
      "comment": "Great quality and very comfortable",
      "helpfulCount": 25,
      "createdAt": "2026-02-03T12:45:00Z"
    }
  ],
  "totalElements": 15,
  "averageRating": 4.6
}
```

---

## 📊 Dashboard APIs

### 1. Get Overview
**Request:**
```
GET /dashboard/overview
Authorization: Bearer {token}
```

**Success Response (200):**
```json
{
  "totalOrders": 1500,
  "totalRevenue": 75000.00,
  "totalCustomers": 450,
  "totalProducts": 250,
  "recentOrders": [
    {
      "id": 1001,
      "orderNumber": "ORD-2026-02-001",
      "totalAmount": 129.99,
      "createdAt": "2026-02-03T12:30:00Z"
    }
  ]
}
```

---

## Error Handling

All error responses follow this format:

**400 Bad Request:**
```json
{
  "error": "Bad Request",
  "message": "Invalid request data",
  "errors": {
    "fieldName": "Field-specific error message"
  },
  "timestamp": "2026-02-03T12:00:00Z"
}
```

**401 Unauthorized:**
```json
{
  "error": "Unauthorized",
  "message": "Authentication token is missing or invalid",
  "timestamp": "2026-02-03T12:00:00Z"
}
```

**403 Forbidden:**
```json
{
  "error": "Forbidden",
  "message": "You don't have permission to access this resource",
  "timestamp": "2026-02-03T12:00:00Z"
}
```

**404 Not Found:**
```json
{
  "error": "Not Found",
  "message": "Resource not found",
  "timestamp": "2026-02-03T12:00:00Z"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred",
  "timestamp": "2026-02-03T12:00:00Z"
}
```

---

## HTTP Status Codes

| Code | Meaning | Common Causes |
|------|---------|---------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 204 | No Content | Request successful, no content to return |
| 400 | Bad Request | Invalid request data |
| 401 | Unauthorized | Missing or invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Resource already exists (duplicate) |
| 500 | Server Error | Unexpected server error |

---

## Testing with cURL

**Login:**
```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"johndoe","password":"password123"}'
```

**Get Products:**
```bash
curl -X GET "http://localhost:8080/api/v1/products?page=0&size=20" \
  -H "Content-Type: application/json"
```

**Create Order (Authenticated):**
```bash
curl -X POST http://localhost:8080/api/v1/orders \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"userId":1,"items":[{"productId":1,"quantity":2}]}'
```

---

Last Updated: February 3, 2026
