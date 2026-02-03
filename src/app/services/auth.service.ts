import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG, getFullUrl } from '../config/api.config';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private baseUrl = getFullUrl(API_CONFIG.ENDPOINTS.AUTH.LOGIN).replace('/login', '');

  constructor(private http: HttpClient) {}

  login(data: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/login`, data);
  }

  register(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, data);
  }

  logout(): Observable<any> {
    return this.http.post(`${this.baseUrl}/logout`, {});
  }

  refresh(): Observable<any> {
    return this.http.post(`${this.baseUrl}/refresh`, {});
  }
}
