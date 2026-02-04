import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { CartService, CartItem } from '../../services/cart.service';
import { Product } from '../../services/product.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatInputModule,
    MatFormFieldModule,
    MatSnackBarModule,
    MatDividerModule
  ],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss'
})
export class CartComponent implements OnInit {
  cartItems = signal<CartItem[]>([]);
  cartTotal = signal(0);
  cartCount = signal(0);

  constructor(
    private cartService: CartService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadCart();
    this.cartService.cart$.subscribe(() => {
      this.loadCart();
    });
  }

  loadCart() {
    this.cartItems.set(this.cartService.getCartItems());
    this.cartTotal.set(this.cartService.getCartTotal());
    this.cartCount.set(this.cartService.getCartItemCount());
  }

  updateQuantity(productId: number, newQuantity: number, size?: string) {
    if (newQuantity <= 0) {
      this.removeItem(productId, size);
      return;
    }

    const item = this.cartItems().find(
      i => i.product.id === productId && i.size === size
    );
    
    if (item && newQuantity > item.product.stockQuantity) {
      this.snackBar.open(
        `⚠️ Only ${item.product.stockQuantity} items available in stock`,
        'OK',
        {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['snackbar-info']
        }
      );
      return;
    }

    this.cartService.updateQuantity(productId, newQuantity, size);
  }

  removeItem(productId: number, size?: string) {
    this.cartService.removeFromCart(productId, size);
    this.snackBar.open('✓ Item removed from cart', 'UNDO', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['snackbar-info']
    });
  }

  incrementQuantity(item: CartItem) {
    if (item.quantity >= item.product.stockQuantity) {
      this.snackBar.open(
        `⚠️ Maximum stock of ${item.product.stockQuantity} reached`,
        'OK',
        {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['snackbar-info']
        }
      );
      return;
    }
    this.updateQuantity(item.product.id, item.quantity + 1, item.size);
  }

  decrementQuantity(item: CartItem) {
    if (item.quantity > 1) {
      this.updateQuantity(item.product.id, item.quantity - 1, item.size);
    } else {
      this.removeItem(item.product.id, item.size);
    }
  }

  clearCart() {
    if (confirm('⚠️ Are you sure you want to remove all items from your cart?')) {
      this.cartService.clearCart();
      this.snackBar.open('✓ Cart cleared successfully', 'OK', {
        duration: 2500,
        horizontalPosition: 'end',
        verticalPosition: 'top',
        panelClass: ['snackbar-success']
      });
    }
  }

  continueShopping() {
    this.router.navigate(['/products']);
  }

  proceedToCheckout() {
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    if (!token) {
      this.snackBar.open('🔒 Please login to proceed to checkout', 'LOGIN', {
        duration: 4000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
        panelClass: ['snackbar-info']
      }).onAction().subscribe(() => {
        this.router.navigate(['/login'], { queryParams: { returnUrl: '/checkout' } });
      });
      return;
    }

    // Validate stock before proceeding
    const outOfStockItems = this.cartItems().filter(
      item => item.quantity > item.product.stockQuantity
    );

    if (outOfStockItems.length > 0) {
      this.snackBar.open(
        '❌ Some items exceed available stock. Please update quantities.',
        'OK',
        {
          duration: 4000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['snackbar-error']
        }
      );
      return;
    }

    this.router.navigate(['/checkout']);
  }

  getItemSubtotal(item: CartItem): number {
    return item.product.price * item.quantity;
  }

  getImageUrl(product: Product): string {
    return product.imageUrls && product.imageUrls.length > 0
      ? product.imageUrls[0]
      : 'assets/placeholder.png';
  }
}
