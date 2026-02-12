import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { OrderService, Order } from '../../../services/order.service';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './account.html',
  styleUrl: './account.scss',
})
export class AccountComponent implements OnInit {
  private authService = inject(AuthService);
  private orderService = inject(OrderService);
  private router = inject(Router);

  user = this.authService.currentUser;
  orders = signal<Order[]>([]);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);

  ngOnInit() {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    this.fetchOrders();
  }

  fetchOrders() {
    const userId = this.authService.currentUserId;
    if (!userId) {
        this.error.set("User identifier not found.");
        this.loading.set(false);
        return;
    }

    this.orderService.getUserOrders(userId).subscribe({
      next: (data) => {
        // Sort by id descending (newest first)
        const sorted = Array.isArray(data) ? data.sort((a, b) => (b.id || 0) - (a.id || 0)) : [];
        this.orders.set(sorted);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Fetch orders error', err);
        // If 404, it might mean no orders for this user yet
        if(err.status === 404) {
             this.orders.set([]);
        } else {
             this.error.set('Could not load orders. Please try again later.');
        }
        this.loading.set(false);
      }
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']); // Redirect to home or login
  }

  // Helper to extract address from the notes field if shippingAddress is empty
  // Legacy support for orders created before we had proper address tables
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

  getStatusLabel(order: Order): string {
    const status = order.status || 'PENDING';
    return status.toUpperCase();
  }

  getStatusClass(order: Order): string {
    const status = (order.status || 'PENDING').toLowerCase();
    return status;
  }

  getOrderItems(order: Order): any[] {
    return (order as any).orderItems || (order as any).items || [];
  }
}
