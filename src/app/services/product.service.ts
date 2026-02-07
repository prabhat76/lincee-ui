import { Injectable, inject } from '@angular/core';
import { ApiService } from '../core/api.service';
import { Observable, catchError, of } from 'rxjs';

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  images: string[];
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
    return this.apiService.get<Product[]>('products/featured');
  }

  private getFallbackProducts(): Product[] {
    return [
      {
        id: 1,
        name: 'OWNERS CLUB HOODIE',
        description: 'Heavyweight cotton jersey',
        price: 180,
        images: ['assets/image.png']
      },
      {
        id: 2,
        name: 'VINTAGE TEE - BLACK',
        description: 'Oversized fit',
        price: 95,
        images: ['assets/image copy 2.png']
      },
      {
        id: 3,
        name: 'CARGO PANTS - OLIVE',
        description: 'Functional utility wear',
        price: 150,
        images: ['assets/image.png']
      },
      {
        id: 4,
        name: 'ZIP HOODIE - GREY',
        description: 'Premium loopback cotton',
        price: 195,
        images: ['assets/image copy 2.png']
      }
    ];
  }
}
