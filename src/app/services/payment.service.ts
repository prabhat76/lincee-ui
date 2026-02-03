import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG, getFullUrl } from '../config/api.config';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private baseUrl = getFullUrl(API_CONFIG.ENDPOINTS.PAYMENTS.BASE);

  constructor(private http: HttpClient) {}

  createPayment(orderId: number, data: any): Observable<any> {
    let params = new HttpParams().set('orderId', orderId);
    return this.http.post(this.baseUrl, data, { params });
  }

  getById(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/${id}`);
  }

  getByOrderId(orderId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/order/${orderId}`);
  }

  getByTransactionId(transactionId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/transaction/${transactionId}`);
  }

  getByStatus(status: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/status/${status}`);
  }

  getUserPayments(userId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/user/${userId}`);
  }

  updateStatus(id: number, status: string): Observable<any> {
    let params = new HttpParams().set('status', status);
    return this.http.patch(`${this.baseUrl}/${id}/status`, {}, { params });
  }

  completePayment(id: number, transactionId: string): Observable<any> {
    let params = new HttpParams().set('transactionId', transactionId);
    return this.http.patch(`${this.baseUrl}/${id}/complete`, {}, { params });
  }

  updatePayment(id: number, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, data);
  }

  deletePayment(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

  getStatsCount(): Observable<any> {
    return this.http.get(`${this.baseUrl}/stats/count`);
  }
}
