import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { OrderService, Order } from '../../../services/order.service';
import { AuthService } from '../../../services/auth.service';
import { NotificationService } from '../../../services/notification.service';
import { ProductService } from '../../../services/product.service';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './order-detail.html',
  styleUrl: './order-detail.scss',
})
export class OrderDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private orderService = inject(OrderService);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private productService = inject(ProductService);

  order = signal<Order | null>(null);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);
  itemImages = signal<Record<number, string>>({});

  ngOnInit() {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    const orderId = this.route.snapshot.paramMap.get('id');
    if (!orderId) {
      this.error.set('Order ID not found');
      this.loading.set(false);
      return;
    }

    this.loadOrder(parseInt(orderId));
  }

  loadOrder(orderId: number) {
    this.orderService.getOrder(orderId).subscribe({
      next: (order) => {
        this.order.set(order);
        this.hydrateItemsIfMissing(orderId, order);
        this.hydrateItemImages(order);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load order', err);
        this.error.set('Failed to load order details. Please try again.');
        this.loading.set(false);
      }
    });
  }

  getStatusLabel(status: string): string {
    return (status || 'PENDING').toUpperCase();
  }

  getStepIndex(status: string): number {
    const steps = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];
    return steps.indexOf(status);
  }

  isStepCompleted(order: Order, step: string): boolean {
    if (order.status === 'CANCELLED') {
      return step === 'PENDING';
    }
    const currentIndex = this.getStepIndex(order.status || 'PENDING');
    const stepIndex = this.getStepIndex(step);
    return currentIndex > stepIndex;
  }

  isStepActive(order: Order, step: string): boolean {
    return order.status === step;
  }

  getOrderItems(order: Order): any[] {
    return this.extractItems(order);
  }

  getItemImage(item: any): string {
    const directImage = item?.productImage || item?.imageUrl || item?.image;
    if (typeof directImage === 'string' && directImage.trim()) {
      return directImage;
    }

    const productId = Number(item?.productId);
    if (Number.isFinite(productId) && this.itemImages()[productId]) {
      return this.itemImages()[productId];
    }

    return 'assets/image.png';
  }

  private extractItems(order: any): any[] {
    const candidates = [
      order?.orderItems,
      order?.items,
      order?.orderItemDtos,
      order?.orderDetails,
      order?.lineItems,
      order?.orderLines,
      order?.products
    ];

    for (const candidate of candidates) {
      if (Array.isArray(candidate)) return candidate;

      if (candidate && typeof candidate === 'object') {
        const nested = candidate.content || candidate.data || candidate.results || candidate.items;
        if (Array.isArray(nested)) return nested;
      }
    }

    return [];
  }

  private hydrateItemsIfMissing(orderId: number, order: Order) {
    if (this.extractItems(order).length > 0) {
      return;
    }

    const userId = this.authService.currentUserId;
    if (!userId) {
      return;
    }

    this.orderService.getUserOrders(userId).subscribe({
      next: (orders) => {
        const fallbackOrder = (orders || []).find((o: any) => Number(o?.id) === Number(orderId));
        if (!fallbackOrder) return;

        const fallbackItems = this.extractItems(fallbackOrder);
        if (fallbackItems.length === 0) return;

        const merged = { ...(order as any), ...(fallbackOrder as any), orderItems: fallbackItems } as Order;
        this.order.set(merged);
        this.hydrateItemImages(merged);
      },
      error: () => {
        // Silent fallback; primary load is already complete.
      }
    });
  }

  getAddress(order: Order): string {
    if (order.shippingAddress && order.shippingAddress.length > 5) return order.shippingAddress;
    const note: string = (order as any).notes || '';
    if (note.includes('Ship to:')) {
      const parts = note.split('|');
      const addressPart = parts.find(p => p.trim().startsWith('Ship to:'));
      if (addressPart) {
        return addressPart.replace('Ship to:', '').trim();
      }
    }
    return note || 'Address info not available';
  }

  goBack() {
    this.router.navigate(['/account']);
  }

  private hydrateItemImages(order: Order) {
    const items = this.extractItems(order);
    const ids = [...new Set(items.map((item: any) => Number(item?.productId)).filter((id: number) => Number.isFinite(id)))];

    ids.forEach((productId: number) => {
      if (this.itemImages()[productId]) {
        return;
      }

      this.productService.getProduct(productId).subscribe({
        next: (product) => {
          const image = product.images?.[0] || 'assets/image.png';
          this.itemImages.update(current => ({ ...current, [productId]: image }));
        },
        error: () => {
          this.itemImages.update(current => ({ ...current, [productId]: 'assets/image.png' }));
        }
      });
    });
  }
}
