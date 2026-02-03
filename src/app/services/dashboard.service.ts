import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG, getFullUrl } from '../config/api.config';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private baseUrl = getFullUrl(API_CONFIG.ENDPOINTS.DASHBOARD.OVERVIEW).replace('/overview', '');

  constructor(private http: HttpClient) {}

  getOverview(): Observable<any> {
    return this.http.get(`${this.baseUrl}/overview`);
  }

  getOrderStats(): Observable<any> {
    return this.http.get(`${this.baseUrl}/orders/statistics`);
  }

  getPaymentStats(): Observable<any> {
    return this.http.get(`${this.baseUrl}/payments/statistics`);
  }

  getProductStats(): Observable<any> {
    return this.http.get(`${this.baseUrl}/products/statistics`);
  }

  getUserStats(): Observable<any> {
    return this.http.get(`${this.baseUrl}/users/statistics`);
  }

  getCartStats(): Observable<any> {
    return this.http.get(`${this.baseUrl}/cart/statistics`);
  }

  getReviewStats(): Observable<any> {
    return this.http.get(`${this.baseUrl}/reviews/statistics`);
  }

  getSummary(): Observable<any> {
    return this.http.get(`${this.baseUrl}/summary`);
  }

  getHealth(): Observable<any> {
    return this.http.get(`${this.baseUrl}/health`);
  }
}
