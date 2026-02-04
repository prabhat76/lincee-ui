import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CartItem } from './cart.service';
import { API_CONFIG, getFullUrl } from '../config/api.config';

export interface OrderRequest {
  userId: number;
  totalAmount: number;
  shippingAddressId?: number;
  billingAddressId?: number;
  paymentMethodId?: number;
  items: {
    productId: number;
    quantity: number;
    size?: string;
  }[];
  shippingMethod?: string;
  notes?: string;
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
    const userId = orderRequest.userId;
    const params = new HttpParams().set('userId', userId.toString());
    
    // Remove userId from body as it's sent as query param
    const { userId: _, ...bodyWithoutUserId } = orderRequest;
    
    return this.http.post<Order>(this.apiUrl, bodyWithoutUserId, { params });
  }

  getOrderById(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/${id}`);
  }

  getUserOrders(userId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/user/${userId}?page=0&size=20`);
  }
}