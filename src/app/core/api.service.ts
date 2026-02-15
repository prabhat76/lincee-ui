import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private baseUrl = 'https://linceecom-production.up.railway.app/api/v1';

  private getHeaders(skipAuth: boolean = false): HttpHeaders {
    let headers = new HttpHeaders();
    if (!skipAuth) {
      const token = localStorage.getItem('token');
      if (token) {
        headers = headers.set('Authorization', `Bearer ${token}`);
      }
    }
    return headers;
  }

  get<T>(endpoint: string, options?: { skipAuth?: boolean }): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}/${endpoint}`, { 
      headers: this.getHeaders(options?.skipAuth) 
    });
  }

  post<T>(endpoint: string, body: any, options?: { skipAuth?: boolean }): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}/${endpoint}`, body, { 
      headers: this.getHeaders(options?.skipAuth) 
    });
  }

  delete<T>(endpoint: string, options?: { skipAuth?: boolean }): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}/${endpoint}`, { 
      headers: this.getHeaders(options?.skipAuth) 
    });
  }

  put<T>(endpoint: string, body: any, options?: { skipAuth?: boolean }): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}/${endpoint}`, body, { 
      headers: this.getHeaders(options?.skipAuth) 
    });
  }

  patch<T>(endpoint: string, body: any, options?: { skipAuth?: boolean }): Observable<T> {
    return this.http.patch<T>(`${this.baseUrl}/${endpoint}`, body, {
      headers: this.getHeaders(options?.skipAuth)
    });
  }

  /**
   * Download blob response (for files like Excel, PDFs, etc.)
   */
  downloadBlob(endpoint: string, options?: { skipAuth?: boolean }): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/${endpoint}`, {
      headers: this.getHeaders(options?.skipAuth),
      responseType: 'blob'
    });
  }
}
