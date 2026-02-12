import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService, Product } from '../../services/product.service';
import { CartService } from '../../services/cart.service';

interface CategoryGroup {
  name: string;
  products: Product[];
  visibleCount: number;
}

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss'
})
export class ProductsComponent implements OnInit {
  private productService = inject(ProductService);
  private cartService = inject(CartService);

  // State
  allProducts: Product[] = [];
  filteredGroups = signal<CategoryGroup[]>([]);
  searchQuery = signal<string>('');
  loading = signal<boolean>(true);

  // Track adding state per product ID
  addingState: { [key: number]: boolean } = {};
  private searchTimeout: any;

  ngOnInit() {
    this.productService.getProducts().subscribe({
      next: (products) => {
        console.log('Products loaded in component:', products);
        this.allProducts = products;
        this.applyFilter();
        this.loading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.loading.set(false);
      }
    });
  }

  onSearch(query: any) {
    const value = typeof query === 'string' ? query : query.target.value;
    this.searchQuery.set(value);
    this.loading.set(true);

    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.applyFilter();
      this.loading.set(false);
    }, 300); // 300ms debounce
  }

  applyFilter() {
    const query = this.searchQuery().toLowerCase();
    
    // 1. Filter
    const filtered = this.allProducts.filter(p => 
      p.name.toLowerCase().includes(query) || 
      (p.category && p.category.toLowerCase().includes(query))
    );

    // 2. Group
    const groups: {[key: string]: Product[]} = {};
    filtered.forEach(p => {
      const cat = p.category || 'Other Drops';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(p);
    });

    // 3. Map to View Model
    const result: CategoryGroup[] = Object.keys(groups).map(cat => ({
      name: cat,
      products: groups[cat],
      visibleCount: 2 // Requirement: Load only 2 initially
    }));

    // Sort categories if needed (optional)
    this.filteredGroups.set(result);
  }

  showMore(group: CategoryGroup) {
    // Show all for this category
    group.visibleCount = group.products.length;
  }

  getQuantity(productId: number): number {
    const cart = this.cartService.cart();
    // Sum quantity of all items with this product ID (across different sizes/colors)
    return cart.items
      .filter(item => item.productId === productId)
      .reduce((acc, item) => acc + item.quantity, 0);
  }

  increaseQuantity(product: Product, event: Event) {
    event.stopPropagation(); // Prevent navigation
    this.addingState[product.id] = true;
    
    // Default to M/Black for quick add from grid
    this.cartService.addToCart(product.id, 1, 'M', 'Black').subscribe({
      next: () => this.addingState[product.id] = false,
      error: () => this.addingState[product.id] = false
    });
  }

  decreaseQuantity(product: Product, event: Event) {
    event.stopPropagation(); // Prevent navigation
    this.addingState[product.id] = true;

    // Use updateQuantity which handles negative updates or removal
    this.cartService.updateQuantity(product.id, -1);
    
    // Simple timeout to reset loading state as updateQuantity is void/complex
    setTimeout(() => this.addingState[product.id] = false, 500);
  }

  addToCart(product: Product, event?: Event) {
    if(event) event.stopPropagation();
    this.increaseQuantity(product, event!);
  }
  
  isAdding(productId: number): boolean {
    return !!this.addingState[productId];
  }

  handleImageError(event: any) {
    event.target.src = 'assets/image.png';
  }
}
