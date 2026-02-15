import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { OrderService, Order } from '../../../services/order.service';
import { AuthService } from '../../../services/auth.service';
import { NotificationService } from '../../../services/notification.service';

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

  order = signal<Order | null>(null);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);

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
    return (order as any).orderItems || (order as any).items || [];
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
}
