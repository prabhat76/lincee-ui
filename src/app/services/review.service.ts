import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG, getFullUrl } from '../config/api.config';

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private baseUrl = getFullUrl(API_CONFIG.ENDPOINTS.REVIEWS.BASE);

  constructor(private http: HttpClient) {}

  addReview(productId: number, userId: number, data: any): Observable<any> {
    let params = new HttpParams().set('productId', productId).set('userId', userId);
    return this.http.post(this.baseUrl, data, { params });
  }

  getById(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/${id}`);
  }

  getProductReviews(productId: number, page?: number, size?: number): Observable<any> {
    let params = new HttpParams().set('page', page || 0).set('size', size || 10);
    return this.http.get(`${this.baseUrl}/product/${productId}`, { params });
  }

  getProductReviewsList(productId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/product/${productId}/list`);
  }

  getUserReviews(userId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/user/${userId}`);
  }

  updateReview(id: number, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, data);
  }

  deleteReview(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

  markHelpful(id: number): Observable<any> {
    return this.http.patch(`${this.baseUrl}/${id}/helpful`, {});
  }

  getProductStats(productId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/product/${productId}/stats`);
  }
}
