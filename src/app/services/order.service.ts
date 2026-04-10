import { Injectable, inject } from '@angular/core';
import { ApiService } from '../core/api.service';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError, of, map } from 'rxjs';

export interface OrderItem {
  productId: number;
  quantity: number;
  price: number;
  unitPrice?: number;
  totalPrice?: number;
  productName?: string;
  size?: string;
  color?: string;
}

export interface Order {
  id?: number;
  user: { id: number };
  orderItems: OrderItem[];
  items?: OrderItem[];
  itemCount?: number;
  totalItems?: number;
  totalQuantity?: number;
  totalAmount: number;
  status: string; // PENDING, CONFIRMED, SHIPPED, DELIVERED
  shippingAddress: string;
  paymentMethod: string;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiService = inject(ApiService);

  private normalizeOrderItem(item: any): OrderItem {
    const quantity = Number(item?.quantity ?? 1) || 1;
    const unitPrice = Number(item?.unitPrice ?? item?.price ?? 0) || 0;
    const totalPrice = Number(item?.totalPrice ?? (unitPrice * quantity)) || 0;

    return {
      ...item,
      quantity,
      unitPrice,
      totalPrice,
      price: unitPrice
    } as OrderItem;
  }

  private normalizeOrder(order: any): any {
    return {
      ...order,
      orderItems: this.extractOrderItems(order).map(item => this.normalizeOrderItem(item)),
      itemCount: order?.itemCount ?? order?.totalItems ?? order?.totalQuantity ?? 0
    };
  }

  private extractOrderItems(order: any): any[] {
    const candidates = [
      order?.orderItems,
      order?.items,
      order?.orderItemDtos,
      order?.orderItemsDto,
      order?.orderDetails,
      order?.lineItems,
      order?.orderLines,
      order?.products
    ];

    for (const candidate of candidates) {
      if (Array.isArray(candidate)) {
        return candidate;
      }

      if (candidate && typeof candidate === 'object') {
        const nested = candidate.content || candidate.data || candidate.results || candidate.items;
        if (Array.isArray(nested)) {
          return nested;
        }
      }
    }

    return [];
  }

  createOrder(orderData: any, userId?: number): Observable<any> {
    const endpoint = userId ? `orders?userId=${encodeURIComponent(userId)}` : 'orders';
    return this.apiService.post(endpoint, orderData).pipe(
      catchError(err => {
        console.error('Failed to create order', err);
        return throwError(() => err);
      })
    );
  }

  getUserOrders(userId: number): Observable<any> {
    return this.apiService.get<any>(`orders/user/${userId}`).pipe(
      catchError(() => this.apiService.get<any>(`orders/user/${userId}/list`)),
      map((data: any) => {
        const raw = Array.isArray(data) ? data : data?.content || [];
        return raw.map((order: any) => this.normalizeOrder(order));
      }),
      catchError(err => {
        console.error(`Failed to load orders for user ${userId}`, err);
        return of([]);
      })
    );
  }

  getOrder(orderId: number): Observable<Order> {
    return this.apiService.get<any>(`orders/${orderId}`).pipe(
      map((data: any) => this.normalizeOrder(data)),
      catchError(err => {
        console.error(`Failed to load order ${orderId}`, err);
        return throwError(() => err);
      })
    );
  }

  getOrdersByStatus(status: string): Observable<Order[]> {
    return this.apiService.get<any>(`orders/status/${status}`).pipe(
      map((data: any) => {
        const raw = Array.isArray(data) ? data : data?.content || [];
        return raw.map((order: any) => this.normalizeOrder(order));
      }),
      catchError(err => {
        console.error(`Failed to load orders with status ${status}`, err);
        return of([]);
      })
    );
  }

  updateOrderStatus(orderId: number, status: string, trackingNumber?: string): Observable<any> {
    const normalizedStatus = status.toUpperCase();
    let endpoint = `orders/${orderId}/status?status=${normalizedStatus}`;
    if (trackingNumber) {
      endpoint += `&trackingNumber=${encodeURIComponent(trackingNumber)}`;
    }
    return this.apiService.patch(endpoint, {});
  }
}
