import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ProductService, Product } from '../../../services/product.service';
import { OrderService, Order } from '../../../services/order.service';
import { AuthService } from '../../../services/auth.service';
import { NotificationService } from '../../../services/notification.service';
import { ProductFormComponent } from '../../product-form/product-form.component';
import { ProductListComponent } from '../../product-list/product-list.component';
import { OrdersSectionComponent } from '../../orders-section/orders-section.component';
import { ExcelImportComponent } from '../../excel-import/excel-import.component';
import { BannerManagementComponent } from '../../banner-management/banner-management.component';
import { ExcelImportResponse } from '../../../services/excel-import.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ProductFormComponent,
    ProductListComponent,
    OrdersSectionComponent,
    ExcelImportComponent,
    BannerManagementComponent
  ],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {
  private productService = inject(ProductService);
  private orderService = inject(OrderService);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  // Products
  products = signal<Product[]>([]);
  loadingProducts = signal(false);
  editingProduct = signal<Product | null>(null);

  // Orders
  orders = signal<Order[]>([]);
  loadingOrders = signal(false);
  currentStatusFilter = signal('PENDING');

  // Shop Items
  shopItems = signal<Product[]>([]);
  loadingShopItems = signal(false);

  // UI State
  error = signal<string | null>(null);
  showExcelImport = signal(false);
  activeTab = signal<'shop' | 'banners' | 'products' | 'orders'>('orders');

  ngOnInit() {
    // Check admin authorization
    if (this.authService.currentUserRole !== 'ADMIN') {
      this.router.navigate(['/account']);
      return;
    }

    // Load data for the initial active tab only
    this.loadDataForActiveTab();
  }

  /**
   * Load data for the currently active tab
   */
  private loadDataForActiveTab(): void {
    switch(this.activeTab()) {
      case 'shop':
        this.loadShopItems();
        break;
      case 'products':
        this.loadProducts();
        break;
      case 'orders':
        this.loadOrders();
        break;
      // 'banners' tab doesn't need initial loading - it loads its own data
    }
  }

  /**
   * Load shop items for display
   */
  loadShopItems(): void {
    this.loadingShopItems.set(true);
    this.productService.getProducts().subscribe({
      next: (products) => {
        this.shopItems.set(products);
        this.loadingShopItems.set(false);
      },
      error: (err) => {
        console.error('Failed to load shop items:', err);
        this.error.set('Failed to load shop items.');
        this.loadingShopItems.set(false);
      }
    });
  }

  /**
   * Load all products
   */
  loadProducts(): void {
    this.loadingProducts.set(true);
    this.productService.getProducts().subscribe({
      next: (products) => {
        this.products.set(products);
        this.loadingProducts.set(false);
      },
      error: (err) => {
        console.error('Failed to load products:', err);
        this.error.set('Failed to load products.');
        this.loadingProducts.set(false);
      }
    });
  }

  /**
   * Load orders by status filter
   */
  loadOrders(): void {
    this.loadingOrders.set(true);
    this.orderService.getOrdersByStatus(this.currentStatusFilter()).subscribe({
      next: (orders) => {
        this.orders.set(orders);
        this.loadingOrders.set(false);
      },
      error: (err) => {
        console.error('Failed to load orders:', err);
        this.error.set('Failed to load orders.');
        this.loadingOrders.set(false);
      }
    });
  }

  /**
   * Handle status filter change for orders
   */
  onStatusFilterChange(status: string): void {
    this.currentStatusFilter.set(status);
    this.loadOrders();
  }

  /**
   * Handle product form submission (create or update)
   */
  onProductSubmitted(event: { isUpdate: boolean; product: Product }): void {
    // Clear editing state
    this.editingProduct.set(null);
    // Reload products to show changes
    this.loadProducts();
  }

  /**
   * Handle edit product
   */
  onEditProduct(product: Product): void {
    this.editingProduct.set(product);
    // Scroll to form
    setTimeout(() => {
      document.querySelector('.product-form')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }

  /**
   * Handle form reset
   */
  onFormReset(): void {
    this.editingProduct.set(null);
  }

  /**
   * Handle product deletion
   */
  onProductDeleted(productId: number): void {
    // Reload products to reflect deletion
    this.loadProducts();
  }

  /**
   * Handle Excel import completion
   */
  onProductImported(result: ExcelImportResponse): void {
    if (result.success) {
      // Reload products to show newly imported ones
      setTimeout(() => this.loadProducts(), 1500);
    }
  }

  /**
   * Toggle Excel import section
   */
  toggleExcelImport(): void {
    this.showExcelImport.set(!this.showExcelImport());
  }

  /**
   * Set active tab
   */
  setActiveTab(tab: 'shop' | 'banners' | 'products' | 'orders'): void {
    this.activeTab.set(tab);
    // Load data for the selected tab only if not already loaded
    switch(tab) {
      case 'shop':
        if (this.shopItems().length === 0 && !this.loadingShopItems()) {
          this.loadShopItems();
        }
        break;
      case 'products':
        if (this.products().length === 0 && !this.loadingProducts()) {
          this.loadProducts();
        }
        break;
      case 'orders':
        if (this.orders().length === 0 && !this.loadingOrders()) {
          this.loadOrders();
        }
        break;
    }
  }
}
