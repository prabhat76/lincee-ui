import { Injectable, inject } from '@angular/core';
import { ApiService } from '../core/api.service';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap, catchError, of, throwError } from 'rxjs';

export interface ProductImage {
  view: string; // 'front', 'back', 'side', 'detail', 'lifestyle'
  url: string;
  altText?: string;
  isPrimary?: boolean;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  images: string[];
  productImages?: ProductImage[]; // Multiple views with metadata
  category?: string;
  imageUrls?: string[];
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
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

  getProductsPaginated(page: number = 0, size: number = 20): Observable<PaginatedResponse<Product>> {
    return this.apiService.get<any>(`products?page=${page}&size=${size}`, { skipAuth: true }).pipe(
      tap(response => console.log('Paginated Products API Response:', response)),
      map(response => {
        if (!response) {
          return { content: [], totalElements: 0, totalPages: 0, size, number: page, first: true, last: true };
        }
        // Handle different response formats
        const content = Array.isArray(response) ? response : (response.content || response.data || response.results || []);
        const totalElements = response.totalElements || response.total || content.length;
        const totalPages = response.totalPages || Math.ceil(totalElements / size);
        
        return {
          content: content.map((p: any) => this.transformProduct(p)),
          totalElements,
          totalPages,
          size: response.size || size,
          number: response.number || page,
          first: response.first ?? (page === 0),
          last: response.last ?? (page >= totalPages - 1)
        };
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
    const productImages = Array.isArray(p.productImages)
      ? p.productImages.map((image: any) => {
          const rawUrl = image?.url || image?.imageUrl || image?.path;
          const normalizedUrl = typeof rawUrl === 'string'
            ? (rawUrl.startsWith('http') ? rawUrl : `${this.BASE_URL}${rawUrl}`)
            : 'assets/image.png';

          return {
            view: image?.view || image?.type || 'image',
            url: normalizedUrl,
            altText: image?.altText,
            isPrimary: image?.isPrimary
          } as ProductImage;
        })
      : undefined;

    return {
      ...p,
      name: p.name || 'Unknown Product',
      category: (typeof p.category === 'object' && p.category !== null) ? p.category.name : (p.category || 'Other'),
      productImages,
      images: (p.imageUrls && p.imageUrls.length > 0)
        ? p.imageUrls.map((url: string) => url.startsWith('http') ? url : `${this.BASE_URL}${url}`)
        : ['assets/image.png']
    };
  }
}
