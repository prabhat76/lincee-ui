import { Injectable, inject } from '@angular/core';
import { ApiService } from '../core/api.service';
import { Observable } from 'rxjs';

export interface ExcelValidationResponse {
  valid: boolean;
  message: string;
}

export interface ExcelImportResponse {
  success: boolean;
  successCount: number;
  errorCount: number;
  updatedProducts: any[];
  errors: string[];
  message: string;
}

export interface ExcelTemplate {
  columns: string[];
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class ExcelImportService {
  private apiService = inject(ApiService);

  /**
   * Download Excel template for bulk product import
   */
  downloadTemplate(): Observable<any> {
    return this.apiService.get('admin/products/template/excel', { 
      skipAuth: false
    });
  }

  /**
   * Validate Excel file before import
   */
  validateExcelFile(file: File): Observable<ExcelValidationResponse> {
    const formData = new FormData();
    formData.append('file', file);

    return this.apiService.post<ExcelValidationResponse>(
      'admin/products/validate/excel',
      formData
    );
  }

  /**
   * Import products from Excel file
   */
  importProductsFromExcel(file: File): Observable<ExcelImportResponse> {
    const formData = new FormData();
    formData.append('file', file);

    return this.apiService.post<ExcelImportResponse>(
      'admin/products/import/excel',
      formData
    );
  }

  /**
   * Validate file type and size
   */
  validateFile(file: File): { valid: boolean; error?: string } {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];

    if (file.size > maxSize) {
      return { valid: false, error: 'File size must be less than 10MB' };
    }

    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'Please upload a valid Excel (.xlsx) file' };
    }

    return { valid: true };
  }

  /**
   * Get Excel template structure
   */
  getTemplateInfo(): ExcelTemplate {
    return {
      columns: [
        'id',
        'name',
        'description',
        'price',
        'discountPrice',
        'category',
        'subCategory',
        'brand',
        'stockQuantity',
        'imageUrls',
        'availableSizes',
        'availableColors',
        'tags',
        'active',
        'featured',
        'weightGrams'
      ],
      description: 'Download template, fill with product data, and import to create/update products'
    };
  }
}
