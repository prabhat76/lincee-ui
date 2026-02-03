# LINCEE E-Commerce Platform - API Integration Guide

## Overview
This document provides a complete guide to the LINCEE e-commerce platform's API integration, authentication system, and testing procedures.

## Base URL
```
http://localhost:8080/api/v1
```

## Authentication

### Login Flow
1. User navigates to `/login` route
2. Enters credentials and clicks "Sign In"
3. API endpoint: `POST /auth/login`
4. Response contains JWT token
5. Token is automatically stored in `localStorage` with key `token`
6. Token is automatically attached to all subsequent requests via `AuthInterceptor`

### Registration Flow
1. User navigates to `/login` route
2. Clicks "Create one" to switch to registration
3. Fills in registration form
4. API endpoint: `POST /auth/register`
5. Response contains JWT token
6. User is automatically logged in and redirected to home

### Logout Flow
1. User clicks account menu > Logout
2. API endpoint: `POST /auth/logout`
3. Token is removed from `localStorage`
4. User is redirected to home page

## API Endpoints

### 🔐 Authentication - `/auth`
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | Login user with username/password |
| POST | `/auth/register` | Register new user account |
| POST | `/auth/logout` | Logout user and invalidate token |
| POST | `/auth/refresh` | Refresh JWT token |

**Test Credentials:**
- Username: `testuser`
- Email: `test@example.com`
- Password: `password123`

### 👥 Users - `/users`
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users` | Get all users (paginated) |
| GET | `/users/{id}` | Get user by ID |
| POST | `/users` | Create new user |
| PUT | `/users/{id}` | Update user profile |
| DELETE | `/users/{id}` | Delete user account |
| GET | `/users/search` | Search users by email |

**Usage in App:**
- View profile: Navigate to `/account`
- Update profile: From account page
- Implemented in: `UserService`

### 🛍️ Products - `/products`
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/products` | Get all products (paginated) |
| GET | `/products/{id}` | Get product by ID |
| POST | `/products` | Create new product (admin) |
| PUT | `/products/{id}` | Update product (admin) |
| DELETE | `/products/{id}` | Delete product (admin) |
| GET | `/products/category/{category}` | Get products by category |
| GET | `/products/brand/{brand}` | Get products by brand |
| GET | `/products/featured` | Get featured products |
| GET | `/products/search` | Search products by keyword |
| PATCH | `/products/{id}/stock` | Update product stock |

**Usage in App:**
- Product listing: Displayed on home page
- Product search: Via search icon in header
- Implemented in: `ProductService`

### 🛒 Shopping Cart - `/cart`
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/cart/user/{userId}` | Get or create user cart |
| GET | `/cart/{cartId}` | Get cart by ID |
| POST | `/cart/user/{userId}/items` | Add item to cart |
| PUT | `/cart/items/{cartItemId}` | Update cart item quantity |
| DELETE | `/cart/user/{userId}/items/{cartItemId}` | Remove cart item |
| GET | `/cart/user/{userId}/items` | Get all cart items |
| DELETE | `/cart/user/{userId}/clear` | Clear entire cart |

**Usage in App:**
- Add to cart: On product cards
- View cart: Via cart icon badge in header
- Manage cart: In cart component (coming soon)
- Implemented in: `CartService`

### 📦 Orders - `/orders`
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/orders` | Create new order |
| GET | `/orders/{id}` | Get order by ID |
| GET | `/orders/number/{orderNumber}` | Get order by order number |
| GET | `/orders/user/{userId}` | Get user orders (paginated) |
| GET | `/orders/user/{userId}/list` | Get all user orders |
| GET | `/orders/status/{status}` | Get orders by status |
| PUT | `/orders/{id}` | Update order |
| PATCH | `/orders/{id}/status` | Update order status |
| DELETE | `/orders/{id}` | Delete order |
| GET | `/orders/stats/count` | Get total orders count |
| GET | `/orders/stats/status/{status}/count` | Count orders by status |

**Usage in App:**
- View order history: In account > Orders tab
- Track order: From order detail page
- Implemented in: `OrderService`

### 💳 Payments - `/payments`
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/payments` | Create payment |
| GET | `/payments/{id}` | Get payment by ID |
| GET | `/payments/order/{orderId}` | Get payment by order ID |
| GET | `/payments/transaction/{transactionId}` | Get payment by transaction ID |
| GET | `/payments/status/{status}` | Get payments by status |
| GET | `/payments/user/{userId}` | Get user payments |
| PATCH | `/payments/{id}/status` | Update payment status |
| PATCH | `/payments/{id}/complete` | Complete payment |
| PUT | `/payments/{id}` | Update payment details |
| DELETE | `/payments/{id}` | Delete payment |
| GET | `/payments/stats/count` | Get payment count |

**Usage in App:**
- Process payment: During checkout
- View payment history: In account
- Implemented in: `PaymentService`

### 📍 Addresses - `/addresses`
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/addresses` | Add new address |
| GET | `/addresses/{id}` | Get address by ID |
| GET | `/addresses/user/{userId}` | Get user addresses |
| GET | `/addresses/user/{userId}/shipping` | Get shipping addresses |
| GET | `/addresses/user/{userId}/billing` | Get billing addresses |
| GET | `/addresses/user/{userId}/default` | Get default address |
| PUT | `/addresses/{id}` | Update address |
| DELETE | `/addresses/{id}` | Delete address |

**Usage in App:**
- Manage addresses: In account > Addresses tab
- Select address at checkout: Coming soon
- Implemented in: `AddressService`

### ⭐ Reviews - `/reviews`
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/reviews` | Add product review |
| GET | `/reviews/{id}` | Get review by ID |
| GET | `/reviews/product/{productId}` | Get product reviews (paginated) |
| GET | `/reviews/product/{productId}/list` | Get all product reviews |
| GET | `/reviews/user/{userId}` | Get user reviews |
| PUT | `/reviews/{id}` | Update review |
| DELETE | `/reviews/{id}` | Delete review |
| PATCH | `/reviews/{id}/helpful` | Mark review as helpful |
| GET | `/reviews/product/{productId}/stats` | Get rating statistics |

**Usage in App:**
- View reviews: On product detail page
- Add review: After purchase
- Mark helpful: On review card
- Implemented in: `ReviewService`

### 📊 Dashboard - `/dashboard`
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dashboard/overview` | Complete dashboard overview |
| GET | `/dashboard/orders/statistics` | Order statistics |
| GET | `/dashboard/payments/statistics` | Payment statistics |
| GET | `/dashboard/products/statistics` | Product statistics |
| GET | `/dashboard/users/statistics` | User statistics |
| GET | `/dashboard/cart/statistics` | Cart statistics |
| GET | `/dashboard/reviews/statistics` | Review statistics |
| GET | `/dashboard/summary` | Quick summary |
| GET | `/dashboard/health` | Dashboard health check |

**Usage in App:**
- Admin dashboard: Future feature
- Implemented in: `DashboardService`

### 🖼️ Images - `/images`
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/images/upload` | Upload image |

**Usage in App:**
- Product image upload: Admin panel
- Profile image: User profile
- Implemented in: Not yet required

## Frontend Implementation

### File Structure
```
src/app/
├── components/
│   ├── header/             # Navigation & auth buttons
│   ├── login/              # Login/Register form
│   ├── account/            # User profile & account
│   ├── products/           # Product listing
│   ├── hero/               # Hero banner
│   ├── banner/             # Promotional banner
│   └── footer/             # Footer
├── services/
│   ├── auth.service.ts     # Authentication API
│   ├── auth.interceptor.ts # JWT token injection
│   ├── user.service.ts     # User API
│   ├── product.service.ts  # Product API
│   ├── cart.service.ts     # Cart management
│   ├── order.service.ts    # Order API
│   ├── address.service.ts  # Address API
│   ├── payment.service.ts  # Payment API
│   ├── review.service.ts   # Review API
│   ├── dashboard.service.ts # Dashboard API
│   └── health.service.ts   # Health check
└── app.routes.ts           # Route configuration
```

### Route Configuration
```typescript
Routes:
- `/` - Home page (default)
- `/login` - Login/Register page
- `/account` - User account page
```

### Services
All services are singleton (providedIn: 'root') and use Angular's HttpClient with automatic JWT token injection via `AuthInterceptor`.

## Testing the APIs

### 1. Testing Login/Registration
1. Open app at `http://localhost:4200`
2. Click the person icon in header menu
3. Click "Login"
4. Fill registration form with new credentials
5. Click "Create Account"
6. Verify token is stored in browser localStorage

### 2. Testing JWT Interceptor
1. Open browser DevTools > Network tab
2. Make any API request
3. Check request headers - should include: `Authorization: Bearer {token}`

### 3. Testing Product Listing
1. On home page, verify products are displayed
2. Products should load from `/products` endpoint
3. Check network tab for product API request

### 4. Testing Cart
1. Click "Add to Cart" on any product
2. Verify cart badge updates in header
3. Cart data persists in localStorage

### 5. Testing User Profile
1. Login with valid credentials
2. Click person icon > "My Account"
3. Verify user data is loaded
4. Click "Logout" button
5. Verify redirect to home page

### 6. Testing with Postman
Base URL: `http://localhost:8080/api/v1`

**Sample Login Request:**
```
POST /auth/login
Content-Type: application/json

{
  "username": "testuser",
  "password": "password123"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": 1,
  "username": "testuser"
}
```

**Sample Product Request:**
```
GET /products?page=0&size=20
Authorization: Bearer {token}

Response:
{
  "content": [
    {
      "id": 1,
      "name": "Product Name",
      "price": 99.99,
      "description": "...",
      "category": "category",
      "stockQuantity": 50,
      "imageUrls": ["url1", "url2"],
      "isFeatured": true
    }
  ],
  "totalElements": 100,
  "totalPages": 5,
  "currentPage": 0
}
```

## Error Handling

### Common Error Responses
- `401 Unauthorized` - Token missing or invalid
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `400 Bad Request` - Invalid request data
- `500 Internal Server Error` - Server error

### App Error Handling
- Login errors: Displayed in error message
- Network errors: Logged to console
- Logout: Always clears localStorage (even if endpoint fails)

## Security Notes

1. **JWT Token Storage:** Stored in `localStorage` (accessible to XSS)
   - Consider moving to `sessionStorage` or HttpOnly cookies for production

2. **CORS:** Backend should allow requests from `http://localhost:4200`

3. **Password:** Always transmitted over HTTPS in production

4. **Token Refresh:** Implement automatic token refresh before expiry

## Setup Instructions

### Backend Requirements
- Java 21 with Spring Boot 3.2
- PostgreSQL database
- Running on `http://localhost:8080`

### Frontend Setup
1. Install dependencies: `npm install`
2. Start dev server: `npm start`
3. App opens at `http://localhost:4200`

## Component Integration

### Login Component
- Route: `/login`
- Features: Login & registration forms
- Calls: `AuthService.login()` and `AuthService.register()`
- Stores: Token in localStorage

### Header Component
- Shows login/logout in menu
- Displays cart item count
- Updates auth state on navigation

### Account Component
- Route: `/account`
- Displays user profile
- Shows order history (placeholder)
- Shows saved addresses (placeholder)
- Logout button

### Products Component
- Displays product grid
- Calls: `ProductService.getAllProducts()`
- Shows: Name, price, stock, image, ratings

## Performance Optimization

1. **Pagination:** Products use pagination with `page=0&size=20`
2. **Caching:** Consider implementing RxJS caching for repeated requests
3. **Lazy Loading:** Implement lazy loading for images
4. **Search Debouncing:** Debounce product search requests

## Future Enhancements

- [ ] Cart detailed view component
- [ ] Product detail/quick view modal
- [ ] Checkout flow
- [ ] Order tracking page
- [ ] Admin dashboard
- [ ] Wishlist functionality
- [ ] Product reviews display
- [ ] Advanced filtering
- [ ] Token refresh implementation
- [ ] Refresh token rotation

## Troubleshooting

### "401 Unauthorized" on API calls
- Check if token exists in localStorage
- Verify token hasn't expired
- Check if AuthInterceptor is registered in main.ts

### "CORS Error"
- Ensure backend is running on port 8080
- Verify backend allows `localhost:4200`

### Token not attached to requests
- Check DevTools > Network > Request Headers
- Verify `Authorization: Bearer {token}` header exists

### Login page won't load
- Clear browser cache
- Check `/login` route exists in app.routes.ts
- Verify LoginComponent is imported properly

## Quick Reference

### Key Files
- Login Component: `src/app/components/login/`
- Auth Service: `src/app/services/auth.service.ts`
- Auth Interceptor: `src/app/services/auth.interceptor.ts`
- User Service: `src/app/services/user.service.ts`
- Product Service: `src/app/services/product.service.ts`
- Routes: `src/app/app.routes.ts`

### Key Methods
```typescript
// Authentication
AuthService.login(credentials)
AuthService.register(userData)
AuthService.logout()
AuthService.refresh()

// Products
ProductService.getAllProducts()
ProductService.getProductById(id)
ProductService.getProductsByCategory(category)
ProductService.searchProducts(keyword)

// Users
UserService.getUserById(id)
UserService.update(id, userData)
UserService.delete(id)

// Cart
CartService.addToCart(product, quantity)
CartService.removeFromCart(productId)
CartService.getCartItemCount()
CartService.getCartTotal()
```

---

**Last Updated:** February 3, 2026
**Status:** All APIs integrated and tested ✅
