import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpEvent, HttpProgressEvent } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { ApiService } from '../core/api.service';

export interface ProductImage {
  view: string; // 'front', 'back', 'side', 'detail', etc.
  url: string;
  altText?: string;
  isPrimary?: boolean;
}

export interface UploadResponse {
  url: string;
  publicId: string;
  view: string;
}

@Injectable({
  providedIn: 'root'
})
export class ImageUploadService {
  private apiService = inject(ApiService);
  private http = inject(HttpClient);
  private readonly API_URL = 'https://linceecom-production.up.railway.app';
  
  uploadProgress$ = new Subject<number>();

  /**
   * Upload multiple images with view types (front, back, etc.)
   * Images are converted to Cloudinary on backend
   */
  uploadProductImages(
    files: Map<string, File>,
    productId?: number
  ): Observable<UploadResponse[]> {
    const formData = new FormData();
    
    files.forEach((file, view) => {
      formData.append('images', file);
      formData.append('views', view);
    });

    if (productId) {
      formData.append('productId', productId.toString());
    }

    return this.apiService.post<UploadResponse[]>('images/upload', formData);
  }

  /**
   * Upload single image with progress tracking
   * Uses the correct endpoint: POST /api/v1/images/upload
   * Body: file (the image file), folder (optional, defaults to "products")
   */
  uploadSingleImage(file: File, folder: string = 'products'): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    console.log('📤 Uploading image to /api/v1/images/upload');
    console.log('📁 Folder:', folder);
    console.log('📄 File:', file.name, `(${(file.size / 1024).toFixed(2)} KB)`);

    // Use apiService.post which includes auth headers and proper base URL
    return this.apiService.post<any>('images/upload', formData);
  }

  /**
   * Validate file before upload
   */
  validateImage(file: File): { valid: boolean; error?: string } {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

    if (file.size > maxSize) {
      return { valid: false, error: 'File size must be less than 5MB' };
    }

    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'Only JPEG, PNG, WebP, and GIF files are allowed' };
    }

    return { valid: true };
  }

  /**
   * Create preview URL for local preview before upload
   */
  createPreviewUrl(file: File): string {
    return URL.createObjectURL(file);
  }

  /**
   * Revoke preview URL to free up memory
   */
  revokePreviewUrl(url: string): void {
    URL.revokeObjectURL(url);
  }

  /**
   * Get recommended image views for products
   */
  getAvailableViews(): string[] {
    return ['front', 'back', 'side', 'detail', 'lifestyle'];
  }

  /**
   * Delete image from Cloudinary (via backend)
   */
  deleteImage(publicId: string): Observable<any> {
    return this.apiService.delete(`images/${publicId}`);
  }
}
