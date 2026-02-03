import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG, getFullUrl } from '../config/api.config';
import { HTTP_GET_OPTIONS, HTTP_POST_OPTIONS } from './http-options.helper';

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  discountPrice?: number | null;
  category: string;
  subCategory?: string | null;
  brand?: string;
  stockQuantity: number;
  minStockLevel?: number;
  imageUrls: string[];
  availableSizes: string[];
  availableColors?: string[];
  active: boolean;
  featured: boolean;
  weightGrams?: number | null;
  tags?: string[] | null;
  createdAt?: string;
  updatedAt?: string;
  // Legacy fields for backward compatibility
  isActive?: boolean;
  isFeatured?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = API_CONFIG.BASE_URL;

  constructor(private http: HttpClient) {}

  getAllProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/products?page=0&size=50`, HTTP_GET_OPTIONS);
  }

  getFeaturedProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/products/featured`, HTTP_GET_OPTIONS);
  }

  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/products/${id}`, HTTP_GET_OPTIONS);
  }

  getProductsByCategory(category: string): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/products/category/${category}`, HTTP_GET_OPTIONS);
  }

  searchProducts(keyword: string): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/products/search?keyword=${keyword}&page=0&size=50`, HTTP_GET_OPTIONS);
  }

  // Admin methods
  createProduct(productData: any): Observable<Product> {
    return this.http.post<Product>(`${this.apiUrl}/products`, productData, HTTP_POST_OPTIONS);
  }

  updateProduct(id: number, productData: any): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/products/${id}`, productData, HTTP_POST_OPTIONS);
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/products/${id}`, HTTP_POST_OPTIONS);
  }
}