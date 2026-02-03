/**
 * API Configuration - Centralized API settings
 * All services reference this file for consistent API endpoints
 */

export const API_CONFIG = {
  // Base API URL - Change this to switch between environments
  BASE_URL: 'https://linceecom-production.up.railway.app/api/v1',
  
  // API Endpoints
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      LOGOUT: '/auth/logout',
      REFRESH: '/auth/refresh'
    },
    USERS: {
      BASE: '/users',
      GET_BY_ID: '/users/:id',
      SEARCH: '/users/search'
    },
    PRODUCTS: {
      BASE: '/products',
      GET_BY_ID: '/products/:id',
      FEATURED: '/products/featured',
      CATEGORY: '/products/category/:category',
      BRAND: '/products/brand/:brand',
      SEARCH: '/products/search'
    },
    CART: {
      USER: '/cart/user/:userId',
      CART_ID: '/cart/:cartId',
      ITEMS: '/cart/user/:userId/items',
      ITEM: '/cart/items/:cartItemId'
    },
    ORDERS: {
      BASE: '/orders',
      GET_BY_ID: '/orders/:id',
      BY_NUMBER: '/orders/number/:orderNumber',
      USER: '/orders/user/:userId',
      STATUS: '/orders/status/:status',
      STATS: '/orders/stats'
    },
    ADDRESSES: {
      BASE: '/addresses',
      GET_BY_ID: '/addresses/:id',
      USER: '/addresses/user/:userId'
    },
    PAYMENTS: {
      BASE: '/payments',
      GET_BY_ID: '/payments/:id',
      ORDER: '/payments/order/:orderId',
      STATUS: '/payments/status/:status'
    },
    REVIEWS: {
      BASE: '/reviews',
      GET_BY_ID: '/reviews/:id',
      PRODUCT: '/reviews/product/:productId',
      USER: '/reviews/user/:userId'
    },
    DASHBOARD: {
      OVERVIEW: '/dashboard/overview',
      STATS: '/dashboard/statistics'
    }
  },
  
  // HTTP Headers
  HEADERS: {
    JSON: { 'Content-Type': 'application/json' },
    FORM: { 'Content-Type': 'multipart/form-data' }
  },
  
  // Default Pagination
  PAGINATION: {
    DEFAULT_PAGE: 0,
    DEFAULT_SIZE: 20,
    DEFAULT_SORT: 'id,desc'
  }
};

export const getFullUrl = (endpoint: string): string => {
  return API_CONFIG.BASE_URL + endpoint;
};
