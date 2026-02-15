import { Component, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService, Order } from '../../services/order.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-orders-section',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="orders-section">
      <!-- Header with Filter -->
      <div class="section-header">
        <h2>Orders</h2>
        <div class="filter">
          <label for="status-filter">Status</label>
          <select 
            id="status-filter" 
            [value]="currentStatus()" 
            (change)="onStatusFilterChange($any($event.target).value)"
          >
            <option *ngFor="let status of statusOptions" [value]="status">
              {{ status }}
            </option>
          </select>
        </div>
      </div>

      <!-- Table -->
      <div class="table" *ngIf="!isLoading()">
        <div class="table-header">
          <span class="col-order">Order ID</span>
          <span class="col-items">Items</span>
          <span class="col-total">Total</span>
          <span class="col-status">Status</span>
          <span class="col-actions">Update Status</span>
        </div>

        <div class="table-row" *ngFor="let order of orders()" [attr.data-order-id]="order.id">
          <span class="col-order">
            <strong>#{{ order.id }}</strong>
          </span>
          <span class="col-items">{{ getOrderItems(order).length }} item(s)</span>
          <span class="col-total">{{ order.totalAmount | currency }}</span>
          <span class="col-status">
            <span [ngClass]="'status-' + order.status?.toLowerCase()">
              {{ order.status }}
            </span>
          </span>
          <div class="col-actions">
            <select 
              [value]="''"
              (change)="onStatusSelect($any($event.target).value, order.id || null)"
              class="status-select"
            >
              <option value="" disabled>-- Select status --</option>
              <option *ngFor="let status of getValidNextStatuses(order)" [value]="status">
                {{ status }}
              </option>
            </select>
            <input 
              *ngIf="shouldShowTrackingInput(order.id)"
              [(ngModel)]="trackingNumbers[order.id || 0]"
              type="text"
              placeholder="Tracking #"
              class="tracking-input"
            />
            <button 
              class="btn btn-small"
              (click)="performUpdate(order)"
              [disabled]="isUpdating() || selectedOrderId() !== order.id"
            >
              {{ isUpdating() && selectedOrderId() === order.id ? '...' : 'Update' }}
            </button>
          </div>
        </div>

        <!-- Empty State -->
        <div class="empty-state" *ngIf="orders().length === 0">
          <p>No orders found. Orders will appear here once customers place them.</p>
        </div>
      </div>

      <!-- Loading State -->
      <div class="loading-state" *ngIf="isLoading()">
        <div class="spinner"></div>
        <p>Loading orders...</p>
      </div>
    </div>
  `,
  styles: [`
    .orders-section {
      margin-top: 30px;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      flex-wrap: wrap;
      gap: 15px;

      h2 {
        margin: 0;
        font-size: 22px;
        color: #333;
      }
    }

    .filter {
      display: flex;
      align-items: center;
      gap: 10px;

      label {
        font-weight: 600;
        color: #666;
      }

      select {
        padding: 10px 15px;
        border: 1px solid #ddd;
        border-radius: 4px;
        background: white;
        cursor: pointer;

        &:focus {
          outline: none;
          border-color: #4CAF50;
          box-shadow: 0 0 5px rgba(76, 175, 80, 0.3);
        }
      }
    }

    .table {
      border: 1px solid #ddd;
      border-radius: 8px;
      overflow: hidden;
      background: white;
    }

    .table-header {
      display: grid;
      grid-template-columns: 100px 100px 120px 120px 1fr;
      gap: 15px;
      padding: 15px 20px;
      background: #f5f5f5;
      font-weight: 600;
      border-bottom: 2px solid #ddd;

      span {
        display: flex;
        align-items: center;
      }
    }

    .table-row {
      display: grid;
      grid-template-columns: 100px 100px 120px 120px 1fr;
      gap: 15px;
      padding: 15px 20px;
      border-bottom: 1px solid #eee;
      align-items: center;
      transition: background-color 0.3s;

      &:hover {
        background-color: #fafafa;
      }

      &:last-child {
        border-bottom: none;
      }
    }

    .col-order {
      font-weight: 600;
      color: #333;

      strong {
        font-size: 15px;
      }
    }

    .col-items {
      color: #666;
      font-size: 14px;
    }

    .col-total {
      font-weight: 600;
      color: #4CAF50;
    }

    .col-status {
      display: flex;
      align-items: center;

      span {
        padding: 4px 12px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;

        &.status-pending {
          background: #fff3cd;
          color: #856404;
        }

        &.status-confirmed {
          background: #cfe2ff;
          color: #084298;
        }

        &.status-shipped {
          background: #d1e7dd;
          color: #0f5132;
        }

        &.status-delivered {
          background: #d1e7dd;
          color: #0a3622;
        }

        &.status-cancelled {
          background: #f8d7da;
          color: #842029;
        }
      }
    }

    .col-actions {
      display: flex;
      gap: 8px;
      align-items: center;
      flex-wrap: wrap;

      .status-select,
      .tracking-input {
        padding: 8px 10px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 13px;

        &:focus {
          outline: none;
          border-color: #4CAF50;
          box-shadow: 0 0 5px rgba(76, 175, 80, 0.3);
        }
      }

      .status-select {
        min-width: 120px;
        background: white;
        cursor: pointer;
      }

      .tracking-input {
        min-width: 100px;
      }

      .btn {
        padding: 8px 15px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-weight: 600;
        transition: all 0.3s;
        font-size: 13px;

        &.btn-small {
          background: #4CAF50;
          color: white;

          &:hover:not(:disabled) {
            background: #45a049;
            transform: translateY(-1px);
          }

          &:disabled {
            background: #ccc;
            cursor: not-allowed;
            opacity: 0.6;
          }
        }
      }
    }

    .empty-state {
      padding: 40px 20px;
      text-align: center;
      color: #999;
      background: #f9f9f9;

      p {
        margin: 10px 0;
        font-size: 14px;
      }
    }

    .loading-state {
      padding: 40px 20px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 15px;

      .spinner {
        width: 40px;
        height: 40px;
        border: 4px solid #f3f3f3;
        border-top: 4px solid #4CAF50;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }

      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      p {
        color: #666;
        font-weight: 500;
      }
    }

    @media (max-width: 1024px) {
      .table-header, .table-row {
        grid-template-columns: 80px 70px 100px 100px 1fr;
      }

      .col-actions {
        flex-direction: column;
        align-items: stretch;

        .status-select,
        .tracking-input,
        .btn {
          width: 100%;
        }
      }
    }

    @media (max-width: 768px) {
      .section-header {
        flex-direction: column;
        align-items: flex-start;

        h2 {
          width: 100%;
        }
      }

      .filter {
        width: 100%;

        select {
          flex: 1;
        }
      }

      .table-header {
        display: none;
      }

      .table-row {
        grid-template-columns: 1fr;
        gap: 10px;
        padding: 15px;
        border: 1px solid #ddd;
        border-radius: 4px;
        margin-bottom: 10px;

        span {
          display: flex;
          gap: 5px;
          padding-bottom: 8px;
          border-bottom: 1px solid #eee;

          &:last-child {
            border-bottom: none;
          }

          &::before {
            content: attr(data-label);
            font-weight: 600;
            min-width: 80px;
          }
        }
      }

      .col-actions {
        flex-direction: column;
        align-items: stretch;
        border-bottom: none !important;

        .status-select,
        .tracking-input,
        .btn {
          width: 100%;
        }
      }
    }
  `]
})
export class OrdersSectionComponent {
  private orderService = inject(OrderService);
  private notificationService = inject(NotificationService);

  orders = input<Order[]>([]);
  isLoading = input(false);

  currentStatus = signal('PENDING');
  statusOptions = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
  selectedStatus = signal('');
  selectedOrderId = signal<number | null>(null);
  isUpdating = signal(false);
  trackingNumbers: { [key: number]: string } = {};

  // Valid status transitions
  private validTransitions: { [key: string]: string[] } = {
    'PENDING': ['CONFIRMED', 'CANCELLED'],
    'CONFIRMED': ['SHIPPED', 'CANCELLED'],
    'SHIPPED': ['DELIVERED', 'CANCELLED'],
    'DELIVERED': ['CANCELLED'],
    'CANCELLED': []
  };

  onStatusFilterChange(value: string): void {
    this.currentStatus.set(value);
    this.orderService.getOrdersByStatus(value).subscribe({
      next: (orders) => {
        // This would need to be passed back to parent or use a service
      },
      error: (err) => {
        console.error('Failed to load orders:', err);
        this.notificationService.error('Failed to load orders');
      }
    });
  }

  onStatusSelect(status: string, orderId: number | null): void {
    this.selectedStatus.set(status);
    this.selectedOrderId.set(orderId);
  }

  performUpdate(order: Order): void {
    const status = this.selectedStatus();
    const orderId = order.id;
    
    if (!orderId || !status) {
      this.notificationService.warning('Please select a status');
      return;
    }

    const trackingNumber = this.trackingNumbers[orderId] || '';
    this.updateOrderStatus(order, status, trackingNumber);
  }

  getValidNextStatuses(order: Order): string[] {
    const currentStatus = order.status || 'PENDING';
    return this.validTransitions[currentStatus.toUpperCase()] || [];
  }

  shouldShowTrackingInput(orderId: number | undefined): boolean {
    if (!orderId) return false;
    const status = this.selectedStatus().toUpperCase();
    return ['SHIPPED', 'DELIVERED'].includes(status) && this.selectedOrderId() === orderId;
  }

  updateOrderStatus(order: Order, status: string, trackingNumber?: string): void {
    if (!order.id || !status) {
      this.notificationService.warning('Please select a status');
      return;
    }

    const currentStatus = order.status || 'PENDING';
    const normalizedStatus = status.toUpperCase();

    // Check if transition is valid
    const allowedNextStatuses = this.validTransitions[currentStatus.toUpperCase()] || [];
    if (!allowedNextStatuses.includes(normalizedStatus)) {
      this.notificationService.error(
        `Cannot transition from ${currentStatus} to ${normalizedStatus}. Valid options: ${allowedNextStatuses.join(', ')}`
      );
      return;
    }

    if (['SHIPPED', 'DELIVERED'].includes(normalizedStatus) && !trackingNumber) {
      this.notificationService.warning('Tracking number is required for shipped/delivered orders.');
      return;
    }

    this.isUpdating.set(true);

    this.orderService.updateOrderStatus(order.id, normalizedStatus, trackingNumber).subscribe({
      next: () => {
        this.notificationService.success(`Order #${order.id} status updated to ${normalizedStatus}!`);
        this.onStatusFilterChange(this.currentStatus());
        this.isUpdating.set(false);
        this.selectedStatus.set('');
        this.selectedOrderId.set(null);
      },
      error: (err) => {
        console.error('Update error:', err);
        this.notificationService.error('Failed to update order status.');
        this.isUpdating.set(false);
      }
    });
  }

  getOrderItems(order: Order): any[] {
    return (order as any).orderItems || (order as any).items || [];
  }
}
