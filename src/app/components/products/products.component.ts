import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService, Product, PaginatedResponse } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

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
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  // State
  allProducts: Product[] = [];
  filteredGroups = signal<CategoryGroup[]>([]);
  searchQuery = signal<string>('');
  loading = signal<boolean>(true);
  loadingMore = signal<boolean>(false);
  
  // Pagination
  currentPage = signal<number>(0);
  pageSize = 20;
  hasMore = signal<boolean>(true);
  totalProducts = signal<number>(0);

  // Track adding state per product ID
  addingState: { [key: number]: boolean } = {};
  private addCooldownUntil: { [key: number]: number } = {};
  private searchTimeout: any;

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.productService.getProductsPaginated(this.currentPage(), this.pageSize).subscribe({
      next: (response: PaginatedResponse<Product>) => {
        console.log('Products loaded in component:', response);
        this.allProducts = [...this.allProducts, ...response.content];
        this.totalProducts.set(response.totalElements);
        this.hasMore.set(!response.last);
        this.applyFilter();
        this.loading.set(false);
        this.loadingMore.set(false);
      },
      error: (err) => {
        console.error(err);
        this.loading.set(false);
        this.loadingMore.set(false);
      }
    });
  }

  loadMore() {
    if (this.hasMore() && !this.loadingMore()) {
      this.loadingMore.set(true);
      this.currentPage.set(this.currentPage() + 1);
      this.loadProducts();
    }
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
      visibleCount: groups[cat].length // Show all products in each category by default
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
    if (!this.ensureAuthenticated()) return;
    if (this.isAdding(product.id)) return;
    const now = Date.now();
    if ((this.addCooldownUntil[product.id] || 0) > now) {
      this.notificationService.warning('Please wait a moment before retrying.');
      return;
    }
    this.addingState[product.id] = true;

    const preferredSize = product.availableSizes?.[0] || 'M';
    const preferredColor = product.availableColors?.[0];
    
    this.cartService.addToCart(product.id, 1, preferredSize, preferredColor).subscribe({
      next: () => this.addingState[product.id] = false,
      error: () => {
        this.addingState[product.id] = false;
        this.addCooldownUntil[product.id] = Date.now() + 1500;
      }
    });
  }

  decreaseQuantity(product: Product, event: Event) {
    event.stopPropagation(); // Prevent navigation
    if (!this.ensureAuthenticated()) return;
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

  getPrimaryImage(product: Product): string {
    return this.getViewImage(product, ['front', 'back'])
      || product.images?.[0]
      || 'assets/image.png';
  }

  getHoverImage(product: Product): string | null {
    return this.getViewImage(product, ['lifestyle'])
      || (product.images && product.images.length > 1 ? product.images[1] : null);
  }

  private getViewImage(product: Product, views: string[]): string | null {
    if (!product.productImages || product.productImages.length === 0) {
      return null;
    }

    const viewSet = views.map(view => view.toLowerCase());
    const match = product.productImages.find(image =>
      image.view && viewSet.includes(image.view.toLowerCase())
    );

    return match?.url || null;
  }

  private ensureAuthenticated(): boolean {
    if (this.authService.isAuthenticated()) {
      return true;
    }

    this.router.navigate(['/login'], { queryParams: { redirect: this.router.url } });
    return false;
  }
}
