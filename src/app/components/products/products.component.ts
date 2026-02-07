import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService, Product } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss'
})
export class ProductsComponent {
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  
  products$: Observable<Product[]> = this.productService.getProducts();

  // Track adding state per product ID
  addingState: { [key: number]: boolean } = {};

  addToCart(product: Product) {
    this.addingState[product.id] = true;
    
    this.cartService.addToCart(product.id, 1).subscribe({
      next: () => {
        setTimeout(() => {
           this.addingState[product.id] = false;
        }, 1000); // Show "Added" for 1 second
      },
      error: (err) => {
        console.error('Failed to add to cart', err);
        this.addingState[product.id] = false;
      }
    });
  }
  
  isAdding(productId: number): boolean {
    return !!this.addingState[productId];
  }
}
