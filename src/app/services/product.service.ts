import { Injectable, inject } from '@angular/core';
import { ApiService } from '../core/api.service';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap, catchError, of, throwError } from 'rxjs';

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  images: string[];
  category?: string;
  imageUrls?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiService = inject(ApiService);
  private readonly BASE_URL = 'https://linceecom-production.up.railway.app';

  getProducts(): Observable<Product[]> {
    return this.apiService.get<any>('products', { skipAuth: true }).pipe(
      tap(response => console.log('Products API Response:', response)),
      map(response => {
        if (!response) return [];
        const items = Array.isArray(response) ? response : (response.content || response.data || response.results || []);
        return items.map((p: any) => this.transformProduct(p));
      })
    );
  }

  getProduct(id: number): Observable<Product> {
    return this.apiService.get<any>(`products/${id}`, { skipAuth: true }).pipe(
      map(p => this.transformProduct(p)),
      catchError(err => {
        console.error(`Failed to load product ${id}`, err);
        return throwError(() => new Error(err));
      })
    );
  }

  getNewArrivals(): Observable<Product[]> {
    return this.apiService.get<any>('products/featured', { skipAuth: true }).pipe(
      tap(response => console.log('Featured API Response:', response)),
      map(response => {
        if (!response) return [];
        const items = Array.isArray(response) ? response : (response.content || response.data || response.results || []);
        return items.map((p: any) => this.transformProduct(p));
      }),
      catchError(err => {
        console.error('Failed to load featured products', err);
        return of([]);
      })
    );
  }

  createProduct(payload: Partial<Product> & { imageUrls?: string[] }): Observable<Product> {
    return this.apiService.post<any>('products', payload).pipe(
      map(p => this.transformProduct(p))
    );
  }

  updateProduct(id: number, payload: Partial<Product> & { imageUrls?: string[] }): Observable<Product> {
    return this.apiService.put<any>(`products/${id}`, payload).pipe(
      map(p => this.transformProduct(p))
    );
  }

  deleteProduct(id: number): Observable<void> {
    return this.apiService.delete<void>(`products/${id}`);
  }

  private transformProduct(p: any): Product {
    return {
      ...p,
      name: p.name || 'Unknown Product',
      category: (typeof p.category === 'object' && p.category !== null) ? p.category.name : (p.category || 'Other'),
      images: (p.imageUrls && p.imageUrls.length > 0)
        ? p.imageUrls.map((url: string) => url.startsWith('http') ? url : `${this.BASE_URL}${url}`)
        : ['assets/image.png']
    };
  }
}
