import { Injectable, inject } from '@angular/core';
import { ApiService } from '../core/api.service';
import { Observable } from 'rxjs';

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  // Add other product properties as needed
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiService = inject(ApiService);

  getProducts(): Observable<Product[]> {
    return this.apiService.get<Product[]>('products');
  }

  getNewArrivals(): Observable<Product[]> {
    return this.apiService.get<Product[]>('products/new-arrivals');
  }
}
