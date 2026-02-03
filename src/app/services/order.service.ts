import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CartItem } from './cart.service';
import { API_CONFIG, getFullUrl } from '../config/api.config';

export interface OrderRequest {
  userId: number;
  shippingAddress: string;
  paymentMethod: string;
  items: {
    productId: number;
    quantity: number;
    size?: string;
  }[];
}

export interface Order {
  id: number;
  totalAmount: number;
  status: string;
  shippingAddress: string;
  paymentMethod: string;
  createdAt: string;
  orderItems: any[];
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = getFullUrl(API_CONFIG.ENDPOINTS.ORDERS.BASE);

  constructor(private http: HttpClient) {}

  createOrder(orderRequest: OrderRequest): Observable<Order> {
    return this.http.post<Order>(this.apiUrl, orderRequest);
  }

  getOrderById(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/${id}`);
  }

  getUserOrders(userId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/user/${userId}?page=0&size=20`);
  }

  createOrderFromCart(cartItems: CartItem[], userId: number, shippingAddress: string, paymentMethod: string): OrderRequest {
    return {
      userId,
      shippingAddress,
      paymentMethod,
      items: cartItems.map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
        size: item.size
      }))
    };
  }
}