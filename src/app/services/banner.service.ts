import { Injectable, inject } from '@angular/core';
import { ApiService } from '../core/api.service';
import { Observable } from 'rxjs';

export interface Banner {
  id: number;
  title: string;
  subtitle?: string;
  imageUrl: string;
  position: 'hero' | 'secondary' | 'promotional';
  link?: string;
  buttonText?: string;
  isActive: boolean;
  displayOrder: number;
  startDate?: Date;
  endDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class BannerService {
  private apiService = inject(ApiService);

  /**
   * Get all banners
   */
  getAllBanners(): Observable<Banner[]> {
    console.log('📋 Fetching all banners...');
    return this.apiService.get<Banner[]>('banners');
  }

  /**
   * Get active banners only
   */
  getActiveBanners(): Observable<Banner[]> {
    console.log('✅ Fetching active banners...');
    return this.apiService.get<Banner[]>('banners/active');
  }

  /**
   * Get banners by position
   */
  getBannersByPosition(position: string): Observable<Banner[]> {
    console.log(`📍 Fetching ${position} banners...`);
    return this.apiService.get<Banner[]>(`banners/position/${position}`);
  }

  /**
   * Get a specific banner by ID
   */
  getBanner(id: number): Observable<Banner> {
    return this.apiService.get<Banner>(`banners/${id}`);
  }

  /**
   * Create new banner
   */
  createBanner(banner: Partial<Banner>): Observable<Banner> {
    console.log('➕ Creating new banner:', banner.title);
    return this.apiService.post<Banner>('admin/banners', banner);
  }

  /**
   * Update existing banner
   */
  updateBanner(id: number, banner: Partial<Banner>): Observable<Banner> {
    console.log('✏️ Updating banner:', id);
    return this.apiService.put<Banner>(`admin/banners/${id}`, banner);
  }

  /**
   * Delete banner
   */
  deleteBanner(id: number): Observable<void> {
    console.log('🗑️ Deleting banner:', id);
    return this.apiService.delete<void>(`admin/banners/${id}`);
  }

  /**
   * Toggle banner active status
   */
  toggleBannerStatus(id: number): Observable<Banner> {
    console.log('🔄 Toggling banner status:', id);
    return this.apiService.patch<Banner>(`admin/banners/${id}/toggle`, {});
  }

  /**
   * Reorder banners
   */
  reorderBanners(bannerIds: number[]): Observable<void> {
    console.log('↕️ Reordering banners');
    return this.apiService.post<void>('admin/banners/reorder', { bannerIds });
  }
}
