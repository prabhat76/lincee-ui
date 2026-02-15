import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ProductService, Product } from '../../../services/product.service';
import { OrderService, Order } from '../../../services/order.service';
import { AuthService } from '../../../services/auth.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {
  private fb = inject(FormBuilder);
  private productService = inject(ProductService);
  private orderService = inject(OrderService);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  products = signal<Product[]>([]);
  orders = signal<Order[]>([]);
  shopItems = signal<Product[]>([]);
  loadingProducts = signal(false);
  loadingOrders = signal(false);
  loadingShopItems = signal(false);
  error = signal<string | null>(null);
  showAllProducts = signal(false);

  statusFilter = signal('PENDING');
  statusOptions = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

  // Valid status transitions
  private validTransitions: { [key: string]: string[] } = {
    'PENDING': ['CONFIRMED', 'CANCELLED'],
    'CONFIRMED': ['SHIPPED', 'CANCELLED'],
    'SHIPPED': ['DELIVERED', 'CANCELLED'],
    'DELIVERED': ['CANCELLED'],
    'CANCELLED': []
  };

  productForm = this.fb.group({
    id: [null as number | null],
    name: ['', Validators.required],
    price: [0, [Validators.required, Validators.min(0)]],
    description: ['', Validators.required],
    category: [''],
    imageUrl: ['']
  });

  ngOnInit() {
    if (this.authService.currentUserRole !== 'ADMIN') {
      this.router.navigate(['/account']);
      return;
    }

    this.loadProducts();
    this.loadOrders();
    this.loadShopItems();
  }

  loadShopItems() {
    this.loadingShopItems.set(true);
    this.productService.getProducts().subscribe({
      next: (products) => {
        this.shopItems.set(products);
        this.loadingShopItems.set(false);
      },
      error: (err) => {
        console.error(err);
        this.error.set('Failed to load shop items.');
        this.loadingShopItems.set(false);
      }
    });
  }

  loadProducts() {
    this.loadingProducts.set(true);
    this.productService.getProducts().subscribe({
      next: (products) => {
        this.products.set(products);
        this.loadingProducts.set(false);
      },
      error: (err) => {
        console.error(err);
        this.error.set('Failed to load products.');
        this.loadingProducts.set(false);
      }
    });
  }

  loadOrders() {
    this.loadingOrders.set(true);
    this.orderService.getOrdersByStatus(this.statusFilter()).subscribe({
      next: (orders) => {
        this.orders.set(orders);
        this.loadingOrders.set(false);
      },
      error: (err) => {
        console.error(err);
        this.error.set('Failed to load orders.');
        this.loadingOrders.set(false);
      }
    });
  }

  onStatusFilterChange(value: string) {
    this.statusFilter.set(value);
    this.loadOrders();
  }

  submitProduct() {
    if (this.productForm.invalid) return;

    const { id, name, price, description, category, imageUrl } = this.productForm.value;
    const payload = {
      name: name || '',
      price: Number(price || 0),
      description: description || '',
      category: category || 'Other',
      imageUrls: imageUrl ? [imageUrl] : []
    };

    if (id) {
      this.productService.updateProduct(id, payload).subscribe({
        next: () => {
          this.notificationService.success(`Product "${name}" updated successfully!`);
          this.productForm.reset({ id: null, name: '', price: 0, description: '', category: '', imageUrl: '' });
          this.loadProducts();
        },
        error: (err) => {
          console.error(err);
          this.notificationService.error('Failed to update product.');
        }
      });
    } else {
      this.productService.createProduct(payload).subscribe({
        next: () => {
          this.notificationService.success(`Product "${name}" created successfully!`);
          this.productForm.reset({ id: null, name: '', price: 0, description: '', category: '', imageUrl: '' });
          this.loadProducts();
        },
        error: (err) => {
          console.error(err);
          this.notificationService.error('Failed to create product.');
        }
      });
    }
  }

  editProduct(product: Product) {
    this.productForm.patchValue({
      id: product.id,
      name: product.name,
      price: product.price,
      description: product.description,
      category: product.category || '',
      imageUrl: product.images?.[0] || ''
    });
  }

  deleteProduct(productId: number) {
    this.productService.deleteProduct(productId).subscribe({
      next: () => {
        this.notificationService.success('Product deleted successfully!');
        this.loadProducts();
      },
      error: (err) => {
        console.error(err);
        this.notificationService.error('Failed to delete product.');
      }
    });
  }

  toggleShowAllProducts() {
    this.showAllProducts.set(!this.showAllProducts());
  }

  getDisplayedProducts(): Product[] {
    const allProducts = this.products();
    return this.showAllProducts() ? allProducts : allProducts.slice(0, 5);
  }

  updateOrderStatus(order: Order, status: string, trackingNumber?: string) {
    if (!order.id) return;

    const currentStatus = order.status || 'PENDING';
    const normalizedStatus = status.toUpperCase();

    // Check if transition is valid
    const allowedNextStatuses = this.validTransitions[currentStatus.toUpperCase()] || [];
    if (!allowedNextStatuses.includes(normalizedStatus)) {
      this.notificationService.error(`Cannot transition from ${currentStatus} to ${normalizedStatus}. Valid options: ${allowedNextStatuses.join(', ')}`);
      return;
    }

    if (['SHIPPED', 'DELIVERED'].includes(normalizedStatus) && !trackingNumber) {
      this.notificationService.warning('Tracking number is required for shipped/delivered orders.');
      return;
    }

    this.orderService.updateOrderStatus(order.id, normalizedStatus, trackingNumber).subscribe({
      next: () => {
        this.notificationService.success(`Order #${order.id} status updated to ${normalizedStatus}!`);
        this.loadOrders();
      },
      error: (err) => {
        console.error(err);
        this.notificationService.error('Failed to update order status.');
      }
    });
  }

  getValidNextStatuses(order: Order): string[] {
    const currentStatus = order.status || 'PENDING';
    return this.validTransitions[currentStatus.toUpperCase()] || [];
  }

  getOrderItems(order: Order): any[] {
    return (order as any).orderItems || (order as any).items || [];
  }
}
