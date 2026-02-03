import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG, getFullUrl } from '../config/api.config';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private baseUrl = getFullUrl(API_CONFIG.ENDPOINTS.AUTH.LOGIN).replace('/login', '');

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
  }

  login(data: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/login`, data, {
      headers: this.getHeaders(),
      withCredentials: false
    });
  }

  register(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, data, {
      headers: this.getHeaders(),
      withCredentials: false
    });
  }

  logout(): Observable<any> {
    return this.http.post(`${this.baseUrl}/logout`, {}, {
      headers: this.getHeaders()
    });
  }

  refresh(): Observable<any> {
    return this.http.post(`${this.baseUrl}/refresh`, {}, {
      headers: this.getHeaders()
    });
  }
}
