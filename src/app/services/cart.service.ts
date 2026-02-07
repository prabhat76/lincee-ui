import { Injectable, inject, signal } from '@angular/core';
import { ApiService } from '../core/api.service';
import { Observable, tap, catchError, of } from 'rxjs';

export interface CartItem {
  id?: number; // Cart Item ID from API
  productId: number;
  quantity: number;
  product?: any;
  productName?: string;
  price?: number;
  size?: string;
  color?: string;
  subtotal?: number;
}

export interface Cart {
  id?: number;
  userId?: number;
  items: CartItem[];
  total: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiService = inject(ApiService);
  
  // Hardcoded user ID for API consumption test (as per docs)
  private userId = 1;
  
  // Signal for reactive UI updates
  cartCount = signal(0);
  
  // Local fallback state
  private localCart: Cart = { items: [], total: 0 };

  getCart(): Observable<Cart> {
    return this.apiService.get<Cart>(`cart/user/${this.userId}`).pipe(
      tap(cart => {
        this.localCart = cart;
        this.updateCount(cart);
      }),
      catchError(err => {
        console.warn('Cart API error, falling back to local state:', err);
        return of(this.localCart);
      })
    );
  }

  addToCart(productId: number, quantity: number = 1): Observable<any> {
    return this.apiService.post<any>(`cart/user/${this.userId}/items`, { productId, quantity }).pipe(
      tap(response => {
        // Optimistic update
        const existingItem = this.localCart.items.find(i => i.productId === productId);
        if (existingItem) {
          existingItem.quantity += quantity;
        } else {
          this.localCart.items.push({ 
            productId, 
            quantity, 
            id: response?.itemId || response?.id 
          });
        }
        this.updateCount(this.localCart);
      }),
      catchError(err => {
        console.warn('Add API error, simulating local update:', err);
        const existingItem = this.localCart.items.find(i => i.productId === productId);
        if (existingItem) {
          existingItem.quantity += quantity;
        } else {
          this.localCart.items.push({ productId, quantity });
        }
        this.updateCount(this.localCart);
        return of(this.localCart);
      })
    );
  }

  removeFromCart(productId: number): Observable<any> {
    // Need to find the cart item ID to call the API correctly
    const item = this.localCart.items.find(i => i.productId === productId);
    const itemId = item?.id;

    // Use itemId if available, otherwise we can't really call the delete endpoint correctly
    // But for "consuming" the API, we attempt it. 
    // If mocking, we just succeed.
    const request$ = itemId 
      ? this.apiService.delete<any>(`cart/items/${itemId}`)
      : of(null); 

    return request$.pipe(
      tap(() => {
        this.localCart.items = this.localCart.items.filter(i => i.productId !== productId);
        this.updateCount(this.localCart);
      }),
      catchError(err => {
         console.warn('Delete API error, simulating local update:', err);
         this.localCart.items = this.localCart.items.filter(i => i.productId !== productId);
         this.updateCount(this.localCart);
         return of(this.localCart);
      })
    );
  }

  private updateCount(cart: Cart) {
    const count = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    this.cartCount.set(count);
  }
}
