import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService, Cart } from '../../../services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent {
  public cartService = inject(CartService);
  
  // Use the signal directly in the template
  cart = this.cartService.cart;

  removeItem(productId: number) {
    this.cartService.removeFromCart(productId).subscribe();
  }

  updateQuantity(productId: number, change: number) {
    this.cartService.updateQuantity(productId, change);
  }

  handleImageError(event: any) {
    event.target.src = 'assets/image.png';
  }
}
