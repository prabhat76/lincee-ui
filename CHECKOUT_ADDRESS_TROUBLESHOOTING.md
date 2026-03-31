# Checkout & Address Creation Troubleshooting Guide

## 🔴 Issue: 500 Internal Server Error on Address Creation

### Problem Description
When users attempt to checkout, they encounter a `500 Internal Server Error` when the system tries to create an address at the endpoint:
```
POST https://linceecom-production-0120.up.railway.app/api/v1/addresses
```

**Error Response:**
```json
{
  "code": "INTERNAL_ERROR",
  "message": "An unexpected error occurred",
  "status": 500,
  "timestamp": "2026-02-15T14:04:25.747167837",
  "path": "/api/v1/addresses"
}
```

---

## 🔧 Recent Fixes Applied

### 1. **Added Missing Optional Fields**
The backend may require `state` and `phoneNumber` fields even though they're marked as optional in the API documentation.

**Fixed in:** [checkout.component.ts](src/app/components/pages/checkout/checkout.component.ts#L278-L291)

```typescript
const addressPayload = {
  userId,
  type: 'SHIPPING' as const,
  street: formVal.address || '',
  city: formVal.city || '',
  state: '', // ✅ Added empty string for optional field
  zipCode: formVal.zip || '',
  country: 'India',
  phoneNumber: '', // ✅ Added empty string for optional field
  isDefault: true
};
```

### 2. **Enhanced Error Logging**
Added comprehensive logging throughout the checkout flow to trace exactly where failures occur.

**Logging Points:**
- ✅ Form values on submission
- ✅ User ID verification
- ✅ Cart state before order
- ✅ Address payload before API call
- ✅ Address ID resolution success/failure
- ✅ Order payload before API call
- ✅ Final error with full details

**Console Logs Pattern:**
```
🚀 Checkout: Starting order creation process...
📋 Form Values: {...}
👤 User ID: 123
🛒 Cart Total: 59.99
📍 Checkout: Creating new address for userId: 123
📦 Checkout: Address payload: {...}
🔵 AddressService: Attempting to create address with payload: {...}
```

### 3. **Improved Error Handling**
Enhanced error handling in `AddressService` and `CheckoutComponent` to provide detailed error information.

**Features:**
- Full error object logging with JSON stringification
- Error status code extraction
- Error message extraction from multiple possible locations
- Enhanced error messages thrown to higher levels

---

## 🔍 Debugging Steps

### Step 1: Check Browser Console
When the error occurs, check the browser console for the following logs:

```javascript
// Look for these emoji markers:
🚀 // Checkout process started
📍 // Address creation initiated
🔵 // AddressService API call
✅ // Success
❌ // Error (this is where you'll see the problem)
```

### Step 2: Verify Required Fields
Check that all required fields are being sent:

**Required Fields:**
- ✅ `userId` (number)
- ✅ `type` (SHIPPING or BILLING)
- ✅ `street` (string)
- ✅ `city` (string)
- ✅ `zipCode` (string)
- ✅ `country` (string)
- ✅ `isDefault` (boolean)

**Optional Fields (may be required by backend):**
- ⚠️ `state` (string)
- ⚠️ `phoneNumber` (string)

### Step 3: Check Authentication
Verify the user is properly authenticated:

```javascript
// In browser console:
const token = localStorage.getItem('authToken');
console.log('Token:', token ? 'Present' : 'Missing');

const user = localStorage.getItem('currentUser');
console.log('User:', JSON.parse(user || '{}'));
```

### Step 4: Test API Directly
Use the browser's Network tab or a tool like Postman to test the endpoint directly:

```bash
curl -X POST https://linceecom-production-0120.up.railway.app/api/v1/addresses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "userId": 1,
    "type": "SHIPPING",
    "street": "123 Test Street",
    "city": "Test City",
    "state": "",
    "zipCode": "12345",
    "country": "India",
    "phoneNumber": "",
    "isDefault": true
  }'
```

### Step 5: Check Backend Logs
If you have access to the backend (Railway logs), check for:
- Database connection errors
- Validation errors
- Null pointer exceptions
- Foreign key constraint violations (userId must exist in users table)

---

## 🚨 Common Causes & Solutions

### Cause 1: Missing or Invalid userId
**Problem:** The `userId` doesn't exist in the database or is null.

**Solution:**
- Verify user is logged in: Check `authService.isAuthenticated()`
- Check user ID extraction: `authService.currentUserId` should return a valid number
- Re-login if token is stale

**Code Location:** [checkout.component.ts](src/app/components/pages/checkout/checkout.component.ts#L311-L319)

---

### Cause 2: Database Constraint Violation
**Problem:** Backend database constraints are failing (e.g., NOT NULL columns, foreign keys).

**Symptoms:**
```json
{
  "code": "INTERNAL_ERROR",
  "message": "could not execute statement; SQL [n/a]; constraint [...]"
}
```

**Solution:**
1. Ensure all NOT NULL fields in the database have values
2. Verify userId references an existing user
3. Check database schema matches API expectations

---

### Cause 3: Backend Validation Errors
**Problem:** Backend is rejecting the request due to validation rules not documented in API docs.

**Symptoms:**
- 500 error without specific message
- Works in Postman but fails in UI

**Solution:**
1. Add all optional fields with default values (already implemented)
2. Check backend code for validation annotations
3. Ensure field names match exactly (case-sensitive)

---

### Cause 4: Authentication Token Issues
**Problem:** Token is expired, invalid, or missing required claims.

**Symptoms:**
```json
{
  "code": "INTERNAL_ERROR",
  "message": "JWT token is expired or invalid"
}
```

**Solution:**
1. Check token expiration: Decode JWT and check `exp` claim
2. Re-login to get fresh token
3. Verify token is being sent in Authorization header

---

### Cause 5: Address Type Mismatch
**Problem:** Backend expects different type values or enum validation is strict.

**Current Value:** `type: 'SHIPPING'`

**Solution:**
- Verify backend accepts "SHIPPING" (not "shipping" or "Shipping")
- Check if backend expects different enum values

---

## 📋 API Contract (Expected by Backend)

Based on API documentation ([API_REQUEST_RESPONSE.md](API_REQUEST_RESPONSE.md#L895-L923)):

```typescript
interface AddressPayload {
  userId: number;           // Required - Must exist in users table
  type: 'SHIPPING' | 'BILLING';  // Required - Enum type
  street: string;           // Required
  city: string;             // Required
  state?: string;           // Optional (but may be required by DB)
  zipCode: string;          // Required
  country: string;          // Required
  phoneNumber?: string;     // Optional (but may be required by DB)
  isDefault: boolean;       // Required
}
```

**Expected Response (201 Created):**
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

## 🔄 Checkout Flow Diagram

```
User Submits Checkout Form
         ↓
┌────────────────────────┐
│ Validate Form          │
│ Check Authentication   │
└────────┬───────────────┘
         ↓
┌────────────────────────┐
│ Check for Existing     │
│ Address (Reuse)        │
└────────┬───────────────┘
         ↓
    [Not Found]
         ↓
┌────────────────────────┐
│ Create New Address     │  ← 500 ERROR OCCURS HERE
│ POST /api/v1/addresses │
└────────┬───────────────┘
         ↓
    [Success]
         ↓
┌────────────────────────┐
│ Get Address ID         │
└────────┬───────────────┘
         ↓
┌────────────────────────┐
│ Create Order           │
│ POST /api/v1/orders    │
└────────┬───────────────┘
         ↓
┌────────────────────────┐
│ Process Payment        │
└────────────────────────┘
```

---

## 🛠️ Next Steps for Investigation

### If Error Persists After Fixes:

1. **Backend Investigation Required:**
   - Check Railway logs for detailed Java stack traces
   - Review address entity and repository code
   - Verify database schema
   - Check validation annotations

2. **Frontend Workaround:**
   - Consider bypassing address creation and using notes field
   - Add phone number field to checkout form
   - Add state/province field to checkout form

3. **Alternative Approach:**
   - Store address in order.notes field temporarily
   - Create address asynchronously after order
   - Use existing addresses only (no creation)

---

## 📞 Support Information

**Related Files:**
- [checkout.component.ts](src/app/components/pages/checkout/checkout.component.ts)
- [address.service.ts](src/app/services/address.service.ts)
- [order.service.ts](src/app/services/order.service.ts)
- [API Documentation](API_REQUEST_RESPONSE.md)

**Backend Endpoint:** `POST /api/v1/addresses`  
**Expected Status:** 201 Created  
**Current Status:** 500 Internal Server Error

---

## ✅ Testing Checklist

After implementing fixes, test:

- [ ] Login with valid credentials
- [ ] Add items to cart
- [ ] Navigate to checkout
- [ ] Fill in all address fields
- [ ] Select payment method
- [ ] Submit order
- [ ] Check browser console for detailed logs
- [ ] Verify no 500 errors
- [ ] Verify order appears in account
- [ ] Verify address is created and reusable

---

## 📝 Implementation Notes

**Files Modified:**
1. `src/app/services/address.service.ts` - Enhanced error logging
2. `src/app/components/pages/checkout/checkout.component.ts` - Added state and phoneNumber fields, comprehensive logging

**Changes:**
- Added `state` field (empty string)
- Added `phoneNumber` field (empty string)
- Enhanced console logging with emoji markers
- Improved error handling with detailed messages
- Added type safety with explicit type annotations
- Imported missing RxJS operators (catchError, tap)

**Build Status:** ✅ Successful  
**TypeScript Errors:** 0  
**Warnings:** 2 (non-critical, unrelated to checkout)

---

## 🎯 Expected Outcome

With these fixes:
1. **Comprehensive Logging:** Every step of checkout is logged with clear emoji markers
2. **Better Error Messages:** Errors include status codes, messages, and full context
3. **Backend Compatibility:** All potentially required fields are now included
4. **Easy Debugging:** Console logs clearly show where process fails

**Next Action:** Test checkout flow and monitor console for detailed error information if 500 persists.
