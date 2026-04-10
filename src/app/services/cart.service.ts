import { Injectable, inject, signal, computed, effect } from '@angular/core';
import { ApiService } from '../core/api.service';
import { ProductService, Product } from './product.service';
import { AuthService } from './auth.service';
import { NotificationService } from './notification.service';
import { Observable, tap, catchError, of, map, combineLatest, switchMap, throwError } from 'rxjs';

export interface CartItem {
  id?: number; // Cart Item ID from API
  productId: number;
  quantity: number;
  size?: string;
  color?: string;
  // Enriched properties
  product?: Product;
  productName?: string;
  price?: number;
  image?: string;
}

export interface Cart {
  items: CartItem[];
  total: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiService = inject(ApiService);
  private productService = inject(ProductService);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  
  // State
  private cartState = signal<Cart>({ items: [], total: 0 });
  
  // Public signals
  cart = computed(() => this.cartState());
  cartCount = computed(() => this.cartState().items.reduce((acc, item) => acc + item.quantity, 0));
  cartTotal = computed(() => this.cartState().items.reduce((acc, item) => acc + (item.quantity * (item.price || 0)), 0));

  constructor() {
    this.initialLoad();
    this.setupAuthSync();
  }

  // Separate method to handle subscription
  private initialLoad() {
    this.loadCart().subscribe();
  }

  private setupAuthSync() {
    effect(() => {
      // React to login/logout changes
      this.authService.currentUser();
      this.loadCart().subscribe();
    });
  }

  getCart(): Observable<Cart> {
    return new Observable(observer => {
      observer.next(this.cartState());
      this.loadCart().subscribe(updatedCart => {
        observer.next(updatedCart);
        observer.complete();
      });
    });
  }

  loadCart(): Observable<Cart> {
    const userId = this.authService.currentUserId;
    if (!userId) {
      return of({ items: [], total: 0 });
    }

    // Use the specific items endpoint which returns rich data
    return this.apiService.get<any>(`cart/user/${userId}/items`).pipe(
      catchError(err => {
        // If cart does not exist yet, create/get it first then retry items.
        if (err?.status === 404) {
          return this.ensureCartExists(userId).pipe(
            switchMap(() => this.apiService.get<any>(`cart/user/${userId}/items`))
          );
        }
        // Backend variants sometimes use /users/{id}/items
        if (err?.status === 400) {
          return this.apiService.get<any>(`cart/users/${userId}/items`);
        }
        return throwError(() => err);
      }),
      map(response => {
        const rawItems = this.extractCartItems(response);

        const cartItems: CartItem[] = rawItems.map((item: any) => ({
          id: item.id,
          productId: item.productId,
          quantity: item.quantity,
          size: item.size,
          color: item.color,
          // API returns rich data, fallback to defaults
          productName: item.productName || 'Unknown Product',
          price: item.unitPrice || item.price || 0,
          image: item.productImage || item.imageUrl || item.image || 'assets/image.png'
        }));

        const total = cartItems.reduce((acc, item) => acc + ((item.price || 0) * item.quantity), 0);
        
        const newCart = { items: cartItems, total };
        this.cartState.set(newCart);
        return newCart;
      }),
      catchError(err => {
        console.error('Failed to load cart', err);
        return of({ items: [], total: 0 });
      })
    );
  }

  addToCart(productId: number, quantity: number = 1, size?: string, color?: string): Observable<any> {
    const userId = this.authService.currentUserId;
    
    // Check if item exists to decide between POST (Create) and PUT (Update)
    // We normalize size/color defaults to match how we call it
    const targetSize = size || 'M';
    const targetColor = color || 'Black';
    
    const existingItem = this.cartState().items.find(item => 
        item.productId === productId && 
        (item.size || 'M') === targetSize && 
        (item.color || 'Black') === targetColor
    );

    // Snapshot current state for rollback
    const previousState = this.cartState();

    if (!userId) {
       // Guest flow remains local-only.
       this.updateLocalState(productId, quantity, targetSize, targetColor);
       console.warn('User not logged in, cart changes are local only');
       return of(true);
    }

    if (existingItem && existingItem.id) {
        // Item exists -> Update Quantity
        // Note: updateLocalState already incremented the quantity locally
        const newTotalQuantity = existingItem.quantity + quantity;
        
        return this.updateItemInCart(existingItem, newTotalQuantity).pipe(
            catchError(err => {
                console.warn('Update existing item failed', err);
                this.cartState.set(previousState);
                throw err;
            })
        );
    } else {
        // Item new -> Create (POST)
        // Current backend contract expects JSON body.
        const payload = {
          productId,
          quantity,
          size: targetSize,
          color: targetColor
        };

        return this.ensureCartExists(userId).pipe(
          switchMap(() => this.postCartItemWithFallback(userId, payload)),
          tap((newItem) => {
             this.notificationService.success('Item added to cart');
          }),
          switchMap(() => this.loadCart()),
          catchError(err => {
            console.warn('Add to cart failed', err);
            this.cartState.set(previousState);
            this.notificationService.error(this.extractErrorMessage(err, 'Failed to add item to cart'));
            throw err;
          })
        );
    }
  }

  updateItemInCart(item: CartItem, quantity: number): Observable<any> {
      const userId = this.authService.currentUserId;
      if (!userId || !item.id) return of(true);
      
      return this.apiService.put(`cart/items/${item.id}`, { quantity }).pipe(
          switchMap(() => this.loadCart())
      );
  }

  removeFromCart(productId: number): Observable<any> {
    const previousState = this.cartState();
    const currentCart = this.cartState();
    const item = currentCart.items.find(i => i.productId === productId);
    const userId = this.authService.currentUserId;
    
    if (item) {
        const newItems = currentCart.items.filter(i => i.productId !== productId);
        this.cartState.set({ ...currentCart, items: newItems });
    }

    if (item?.id) {
       // Revert to strict item delete, assuming user-scoped DELETE is also 405
       return this.apiService.delete(`cart/user/${userId}/items/${item.id}`).pipe(
         tap(() => this.notificationService.success('Item removed from cart')),
         switchMap(() => this.loadCart()), // Ensure sync
         catchError(err => {
            console.error('Remove failed', err);
            this.notificationService.error('Failed to remove item from cart');
            // Rollback
            this.cartState.set(previousState);
            return of(true);
         })
       );
    }
    return of(true);
  }

  clearLocalCart() {
    this.cartState.set({ items: [], total: 0 });
  }

  clearCart(): Observable<any> {
    const userId = this.authService.currentUserId;
    this.clearLocalCart();

    if (!userId) {
      return of(true);
    }

    return this.apiService.delete(`cart/user/${userId}/clear`).pipe(
      catchError(err => {
        if (err?.status === 404) {
          return this.apiService.delete(`cart/user/${userId}`);
        }
        return throwError(() => err);
      }),
      tap(() => {
        this.notificationService.success('Cart cleared');
        this.clearLocalCart();
      }),
      catchError(err => {
        console.error('Failed to clear cart', err);
        this.notificationService.error('Failed to clear cart');
        return of(true);
      })
    );
  }

  updateQuantity(productId: number, change: number) {
    const currentCart = this.cartState();
    const item = currentCart.items.find(i => i.productId === productId);
    const userId = this.authService.currentUserId;
    
    if (item) {
      const newQuantity = item.quantity + change;
      
      // Optimistic Update
      const previousState = this.cartState();
      this.updateLocalState(productId, change, item.size, item.color); // This adds change to current

      // If quantity drops to zero or less, remove the item
      if (newQuantity <= 0) {
        this.removeFromCart(productId).subscribe({
            error: () => this.cartState.set(previousState)
        });
        return;
      } 
      
      // Backend Sync
      if (userId) {
        if (item.id) {
            // Update using Delete+ReAdd strategy
            this.updateItemInCart(item, newQuantity).subscribe({
                error: (err) => {
                    console.error('Update quantity failed', err);
                    this.cartState.set(previousState);
                }
            });
        } else {
            // It's an optimistic item without ID yet (should be rare now with switchMap)
            // But if it happens, we can't reliably update. 
            // Better to revert and warn, or try add if we are sure?
            // "Adding" again (POST) might cause 400 Duplicate.
            // Best safe bet: Revert.
            console.warn('Cannot update item without ID (sync pending)');
            this.cartState.set(previousState); 
        }
      }
    }
  }

  private updateLocalState(productId: number, quantity: number, size?: string, color?: string) {
    const current = this.cartState();
    const items = [...current.items];
    const index = items.findIndex(i => i.productId === productId && (i.size||'M') === (size||'M'));
    
    if (index > -1) {
      const newQty = items[index].quantity + quantity;
      if (newQty <= 0) {
         items.splice(index, 1);
      } else {
         items[index] = { ...items[index], quantity: newQty };
      }
    } else if (quantity > 0) {
      items.push({ 
        productId, 
        quantity,
        productName: 'Adding...',
        price: 0,
        size: size || 'M',
        color: color || 'Black'
      });
    }
    
    // Recalculate total immediately to reflect UI changes without negative values
    const total = items.reduce((acc, i) => acc + (i.quantity * (i.price || 0)), 0);
    this.cartState.set({ items, total });
  }

  private extractCartItems(response: any): any[] {
    if (Array.isArray(response)) {
      return response;
    }
    if (Array.isArray(response?.items)) {
      return response.items;
    }
    return [];
  }

  private ensureCartExists(userId: number): Observable<any> {
    return this.apiService.get<any>(`cart/user/${userId}`).pipe(
      catchError(err => {
        // Some deployments expose /users/{id}
        if (err?.status === 404) {
          return this.apiService.get<any>(`cart/users/${userId}`);
        }
        return throwError(() => err);
      })
    );
  }

  private extractErrorMessage(err: any, fallback: string): string {
    if (err?.error?.details) {
      return err.error.details;
    }
    if (err?.error?.message) {
      return err.error.message;
    }
    if (typeof err?.error === 'string' && err.error.trim()) {
      return err.error;
    }
    if (err?.message) {
      return err.message;
    }
    if (err?.status) {
      return `${fallback} (HTTP ${err.status})`;
    }
    return fallback;
  }

  private postCartItemWithFallback(userId: number, payload: { productId: number; quantity: number; size?: string; color?: string; }): Observable<any> {
    let queryParams = `?productId=${encodeURIComponent(payload.productId)}&quantity=${encodeURIComponent(payload.quantity)}`;
    if (payload.size) queryParams += `&size=${encodeURIComponent(payload.size)}`;
    if (payload.color) queryParams += `&color=${encodeURIComponent(payload.color)}`;

    return this.apiService.post<any>(`cart/user/${userId}/items${queryParams}`, {}).pipe(
      catchError(err => {
        // Some deployments expose /users/{id}/items instead of /user/{id}/items
        if (err?.status === 404) {
          return this.apiService.post<any>(`cart/users/${userId}/items${queryParams}`, {});
        }
        // For backend 5xx, avoid spamming multiple POST retries from frontend.
        // Let the caller surface the server error clearly.
        return throwError(() => err);
      })
    );
  }
}
