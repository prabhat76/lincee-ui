import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../config/api.config';
import { HTTP_GET_OPTIONS, HTTP_POST_OPTIONS } from './http-options.helper';

export interface Collection {
  id: number;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  active: boolean;
  featured: boolean;
  displayOrder: number;
  productCount: number;
  products?: any[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateCollectionRequest {
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  active?: boolean;
  featured?: boolean;
  displayOrder?: number;
}

@Injectable({
  providedIn: 'root'
})
export class CollectionService {
  private apiUrl = API_CONFIG.BASE_URL;

  constructor(private http: HttpClient) {}

  // Public endpoints
  getActiveCollections(): Observable<Collection[]> {
    return this.http.get<Collection[]>(`${this.apiUrl}/collections`, HTTP_GET_OPTIONS);
  }

  getFeaturedCollections(): Observable<Collection[]> {
    return this.http.get<Collection[]>(`${this.apiUrl}/collections/featured`, HTTP_GET_OPTIONS);
  }

  getCollectionById(id: number): Observable<Collection> {
    return this.http.get<Collection>(`${this.apiUrl}/collections/${id}`, HTTP_GET_OPTIONS);
  }

  getCollectionBySlug(slug: string): Observable<Collection> {
    return this.http.get<Collection>(`${this.apiUrl}/collections/slug/${slug}`, HTTP_GET_OPTIONS);
  }

  // Admin endpoints
  getAllCollections(): Observable<Collection[]> {
    return this.http.get<Collection[]>(`${this.apiUrl}/collections/admin/all`, HTTP_GET_OPTIONS);
  }

  createCollection(data: CreateCollectionRequest): Observable<Collection> {
    return this.http.post<Collection>(`${this.apiUrl}/collections/admin`, data, HTTP_POST_OPTIONS);
  }

  updateCollection(id: number, data: CreateCollectionRequest): Observable<Collection> {
    return this.http.put<Collection>(`${this.apiUrl}/collections/admin/${id}`, data, HTTP_POST_OPTIONS);
  }

  deleteCollection(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/collections/admin/${id}`, HTTP_POST_OPTIONS);
  }

  addProductToCollection(collectionId: number, productId: number): Observable<Collection> {
    return this.http.post<Collection>(
      `${this.apiUrl}/collections/admin/${collectionId}/products/${productId}`,
      {},
      HTTP_POST_OPTIONS
    );
  }

  removeProductFromCollection(collectionId: number, productId: number): Observable<Collection> {
    return this.http.delete<Collection>(
      `${this.apiUrl}/collections/admin/${collectionId}/products/${productId}`,
      HTTP_POST_OPTIONS
    );
  }

  addMultipleProducts(collectionId: number, productIds: number[]): Observable<Collection> {
    return this.http.post<Collection>(
      `${this.apiUrl}/collections/admin/${collectionId}/products/batch`,
      productIds,
      HTTP_POST_OPTIONS
    );
  }
}
