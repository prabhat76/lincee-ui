import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG, getFullUrl } from '../config/api.config';

@Injectable({ providedIn: 'root' })
export class AddressService {
  private baseUrl = getFullUrl(API_CONFIG.ENDPOINTS.ADDRESSES.BASE);

  constructor(private http: HttpClient) {}

  addAddress(userId: number, data: any): Observable<any> {
    let params = new HttpParams().set('userId', userId);
    return this.http.post(this.baseUrl, data, { params });
  }

  createAddress(data: any): Observable<any> {
    return this.http.post(this.baseUrl, data);
  }

  getById(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/${id}`);
  }

  getUserAddresses(userId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/user/${userId}`);
  }

  getShippingAddresses(userId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/user/${userId}/shipping`);
  }

  getBillingAddresses(userId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/user/${userId}/billing`);
  }

  getDefaultAddress(userId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/user/${userId}/default`);
  }

  updateAddress(id: number, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, data);
  }

  deleteAddress(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}
