import { Injectable, inject } from '@angular/core';
import { ApiService } from '../core/api.service';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError, of, map } from 'rxjs';

export interface OrderItem {
  productId: number;
  quantity: number;
  price: number;
}

export interface Order {
  id?: number;
  user: { id: number };
  orderItems: OrderItem[];
  items?: OrderItem[];
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
    return this.apiService.get<any>(`orders/user/${userId}/list`).pipe(
      catchError(() => this.apiService.get<any>(`orders/user/${userId}`)),
      map((data: any) => {
        const raw = Array.isArray(data) ? data : data?.content || [];
        return raw.map((order: any) => ({
          ...order,
          orderItems: order.orderItems || order.items || []
        }));
      }),
      catchError(err => {
        console.error(`Failed to load orders for user ${userId}`, err);
        return of([]);
      })
    );
  }

  getOrder(orderId: number): Observable<Order> {
    return this.apiService.get<any>(`orders/${orderId}`).pipe(
      map((data: any) => ({
        ...data,
        orderItems: data.orderItems || data.items || []
      })),
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
        return raw.map((order: any) => ({
          ...order,
          orderItems: order.orderItems || order.items || []
        }));
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
