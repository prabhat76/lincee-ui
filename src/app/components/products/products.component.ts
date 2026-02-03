import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ProductService, Product } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, HttpClientModule, MatCardModule, MatButtonModule, MatIconModule, MatChipsModule, MatProgressSpinnerModule],
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss'
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  loading = true;

  constructor(
    private productService: ProductService,
    private cartService: CartService
  ) {}

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.productService.getAllProducts().subscribe({
      next: (response) => {
        this.products = response.content || response;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.loading = false;
        // Fallback data
        this.products = [
          { id: 1, name: 'Premium Hoodie', price: 89, category: 'Hoodies', description: 'Premium cotton blend hoodie with modern fit', stockQuantity: 10, imageUrls: [], availableSizes: ['S', 'M', 'L', 'XL'], isActive: true, isFeatured: true },
          { id: 2, name: 'Street Jacket', price: 129, category: 'Jackets', description: 'Urban style jacket with premium materials', stockQuantity: 5, imageUrls: [], availableSizes: ['M', 'L', 'XL'], isActive: true, isFeatured: false },
          { id: 3, name: 'Urban T-Shirt', price: 39, category: 'T-Shirts', description: 'Comfortable urban style t-shirt', stockQuantity: 20, imageUrls: [], availableSizes: ['S', 'M', 'L'], isActive: true, isFeatured: true },
          { id: 4, name: 'Cargo Pants', price: 79, category: 'Pants', description: 'Functional cargo pants with multiple pockets', stockQuantity: 8, imageUrls: [], availableSizes: ['M', 'L', 'XL'], isActive: true, isFeatured: false },
          { id: 5, name: 'Sneaker Collection', price: 159, category: 'Shoes', description: 'Limited edition streetwear sneakers', stockQuantity: 3, imageUrls: [], availableSizes: ['8', '9', '10', '11'], isActive: true, isFeatured: true },
          { id: 6, name: 'Baseball Cap', price: 29, category: 'Accessories', description: 'Classic baseball cap with embroidered logo', stockQuantity: 15, imageUrls: [], availableSizes: ['One Size'], isActive: true, isFeatured: false }
        ];
      }
    });
  }

  addToCart(product: Product) {
    this.cartService.addToCart(product);
  }
}