import { Component, EventEmitter, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExcelImportService, ExcelImportResponse, ExcelValidationResponse } from '../../services/excel-import.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-excel-import',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="excel-import-container">
      <h3>Bulk Product Import</h3>
      <p class="subtitle">Upload an Excel file to create or update multiple products at once</p>

      <!-- Download Template Button -->
      <div class="template-section">
        <div class="template-info">
          <h4>📥 Step 1: Download Template</h4>
          <p>Download the Excel template with the correct column headers</p>
        </div>
        <button class="btn btn-secondary" (click)="downloadTemplate()" [disabled]="downloading()">
          {{ downloading() ? 'Downloading...' : 'Download Excel Template' }}
        </button>
      </div>

      <!-- Template Info -->
      <div class="template-columns-info">
        <h4>📋 Excel Columns (16 fields)</h4>
        <div class="columns-grid">
          <div class="column-item" *ngFor="let column of templateColumns">
            <span class="column-name">{{ column }}</span>
          </div>
        </div>
      </div>

      <!-- File Upload Section -->
      <div class="upload-section">
        <div class="upload-header">
          <h4>📤 Step 2: Upload Filled Excel</h4>
          <p>Select your completed Excel file</p>
        </div>

        <div class="file-input-wrapper">
          <label class="file-input-label">
            <span class="btn btn-primary">{{ selectedFile() ? 'Change File' : 'Choose Excel File' }}</span>
            <input
              type="file"
              (change)="onFileSelected($event)"
              accept=".xlsx,.xls"
              [disabled]="importing()"
              class="file-input"
            />
          </label>
          <span class="file-name" *ngIf="selectedFile()">{{ selectedFile()?.name }}</span>
        </div>

        <!-- File Validation -->
        <div class="validation-section" *ngIf="selectedFile()">
          <div class="validation-steps">
            <div class="step" [class.completed]="fileValidated()">
              <span class="step-number">1</span>
              <span class="step-label">Validate File</span>
              <button
                type="button"
                class="btn-validate"
                (click)="validateFile()"
                [disabled]="importing() || validating()"
              >
                {{ validating() ? 'Validating...' : 'Check' }}
              </button>
            </div>

            <div class="step" [class.completed]="importCompleted()" [class.disabled]="!fileValidated()">
              <span class="step-number">2</span>
              <span class="step-label">Import Products</span>
              <button
                type="button"
                class="btn-import"
                (click)="importExcel()"
                [disabled]="!fileValidated() || importing()"
              >
                {{ importing() ? 'Importing...' : 'Import' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Validation Error -->
        <div class="error-message" *ngIf="validationError()">
          <span class="error-icon">⚠️</span>
          {{ validationError() }}
        </div>

        <!-- Validation Success -->
        <div class="success-message" *ngIf="validationSuccess()">
          <span class="success-icon">✓</span>
          {{ validationSuccess() }}
        </div>
      </div>

      <!-- Import Results -->
      <div class="import-results" *ngIf="importResult()">
        <h4>📊 Import Results</h4>
        <div class="results-summary">
          <div class="result-item success">
            <span class="result-label">Successfully Imported</span>
            <span class="result-value">{{ importResult()?.successCount }}</span>
          </div>
          <div class="result-item" [class.error]="(importResult()?.errorCount ?? 0) > 0">
            <span class="result-label">Errors</span>
            <span class="result-value">{{ importResult()?.errorCount }}</span>
          </div>
        </div>

        <!-- Error Details -->
        <div class="error-details" *ngIf="(importResult()?.errors ?? []).length > 0">
          <h5>Error Details</h5>
          <div class="error-list">
            <div class="error-item" *ngFor="let error of importResult()?.errors">
              <span class="error-text">{{ error }}</span>
            </div>
          </div>
        </div>

        <!-- Imported Products Summary -->
        <div class="imported-products" *ngIf="(importResult()?.updatedProducts ?? []).length > 0">
          <h5>Imported Products (showing first 5)</h5>
          <div class="products-table">
            <div class="table-header">
              <span>ID</span>
              <span>Name</span>
              <span>Price</span>
              <span>Stock</span>
            </div>
            <div class="table-row" *ngFor="let product of (importResult()?.updatedProducts ?? []).slice(0, 5)">
              <span>#{{ product.id }}</span>
              <span>{{ product.name }}</span>
              <span>{{ product.price | currency }}</span>
              <span>{{ product.stockQuantity }}</span>
            </div>
          </div>
          <div class="view-all" *ngIf="(importResult()?.updatedProducts ?? []).length > 5">
            <p>... and {{ (importResult()?.updatedProducts ?? []).length - 5 }} more products</p>
          </div>
        </div>

        <!-- Clear Results Button -->
        <button class="btn btn-secondary" (click)="clearResults()">Clear Results</button>
      </div>

      <!-- Help Section -->
      <div class="help-section">
        <h4>💡 Tips</h4>
        <ul>
          <li>Download the template first to see the exact column structure</li>
          <li>Leave <strong>id</strong> empty to create new products</li>
          <li>Fill <strong>id</strong> to update existing products</li>
          <li>For multiple values, use comma-separated: <code>S,M,L,XL</code></li>
          <li>Image URLs should be from Cloudinary (use image upload feature first)</li>
          <li>Max file size: 10MB</li>
        </ul>
      </div>
    </div>
  `,
  styles: [`
    .excel-import-container {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 24px;
      margin-bottom: 24px;
    }

    h3 {
      font-size: 18px;
      font-weight: 600;
      color: #111827;
      margin: 0 0 8px 0;
    }

    .subtitle {
      font-size: 14px;
      color: #6b7280;
      margin: 0 0 20px 0;
    }

    h4 {
      font-size: 16px;
      font-weight: 600;
      color: #111827;
      margin: 0 0 12px 0;
    }

    h5 {
      font-size: 14px;
      font-weight: 600;
      color: #111827;
      margin: 12px 0 8px 0;
    }

    /* Template Section */
    .template-section {
      background: white;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
    }

    .template-info {
      flex: 1;

      h4 {
        margin: 0 0 4px 0;
      }

      p {
        margin: 0;
        font-size: 14px;
        color: #6b7280;
      }
    }

    /* Template Columns Info */
    .template-columns-info {
      background: white;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 20px;
    }

    .columns-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: 12px;
    }

    .column-item {
      padding: 10px;
      background: #f3f4f6;
      border: 1px solid #d1d5db;
      border-radius: 4px;
      font-size: 13px;
      font-weight: 500;
      color: #374151;
      text-align: center;
    }

    /* Upload Section */
    .upload-section {
      background: white;
      border: 2px dashed #d1d5db;
      border-radius: 8px;
      padding: 24px;
      margin-bottom: 20px;
    }

    .upload-header {
      margin-bottom: 16px;

      h4 {
        margin: 0 0 4px 0;
      }

      p {
        margin: 0;
        font-size: 14px;
        color: #6b7280;
      }
    }

    .file-input-wrapper {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
    }

    .file-input-label {
      display: flex;
      cursor: pointer;
    }

    .file-input {
      display: none;
    }

    .file-name {
      font-size: 14px;
      color: #059669;
      font-weight: 500;
      padding: 8px 12px;
      background: #ecfdf5;
      border-radius: 4px;
    }

    /* Validation Section */
    .validation-section {
      margin-top: 16px;
    }

    .validation-steps {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
    }

    .step {
      flex: 1;
      padding: 12px;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      display: flex;
      align-items: center;
      gap: 12px;
      background: white;
      transition: all 0.2s;

      &.completed {
        background: #ecfdf5;
        border-color: #059669;
      }

      &.disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }

    .step-number {
      min-width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #e5e7eb;
      color: #374151;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 14px;

      .step.completed & {
        background: #059669;
        color: white;
      }
    }

    .step-label {
      flex: 1;
      font-size: 14px;
      font-weight: 500;
      color: #374151;
    }

    .btn-validate,
    .btn-import {
      padding: 6px 12px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
      font-weight: 600;
      transition: all 0.2s;
      white-space: nowrap;
    }

    .btn-validate {
      background: #dbeafe;
      color: #1e40af;

      &:hover:not(:disabled) {
        background: #bfdbfe;
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }

    .btn-import {
      background: #dcfce7;
      color: #166534;

      &:hover:not(:disabled) {
        background: #bbf7d0;
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }

    /* Messages */
    .error-message,
    .success-message {
      padding: 12px;
      border-radius: 6px;
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 16px;
    }

    .error-message {
      background: #fee2e2;
      border: 1px solid #fecaca;
      color: #991b1b;

      .error-icon {
        font-size: 16px;
      }
    }

    .success-message {
      background: #dcfce7;
      border: 1px solid #bbf7d0;
      color: #166534;

      .success-icon {
        font-size: 16px;
      }
    }

    /* Import Results */
    .import-results {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 16px;
      margin-top: 20px;
    }

    .results-summary {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
      margin-bottom: 16px;
    }

    .result-item {
      padding: 12px;
      background: white;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      text-align: center;

      &.success {
        background: #ecfdf5;
        border-color: #6ee7b7;
      }

      &.error {
        background: #fee2e2;
        border-color: #fecaca;
      }
    }

    .result-label {
      display: block;
      font-size: 13px;
      color: #6b7280;
      margin-bottom: 4px;
    }

    .result-value {
      display: block;
      font-size: 28px;
      font-weight: 700;
      color: #059669;

      .result-item.error & {
        color: #dc2626;
      }
    }

    /* Error Details */
    .error-details {
      margin-bottom: 16px;
      padding: 12px;
      background: #fee2e2;
      border: 1px solid #fecaca;
      border-radius: 6px;

      h5 {
        color: #991b1b;
        margin-top: 0;
      }
    }

    .error-list {
      display: flex;
      flex-direction: column;
      gap: 6px;
      max-height: 200px;
      overflow-y: auto;
    }

    .error-item {
      padding: 6px 8px;
      background: white;
      border-radius: 4px;
      font-size: 13px;
      color: #991b1b;
    }

    /* Products Table */
    .imported-products {
      margin: 16px 0;
    }

    .products-table {
      background: white;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      overflow: hidden;
    }

    .table-header {
      display: grid;
      grid-template-columns: 1fr 2fr 1fr 1fr;
      background: #f3f4f6;
      border-bottom: 1px solid #d1d5db;
      padding: 12px;
      font-weight: 600;
      font-size: 13px;
      color: #374151;
    }

    .table-row {
      display: grid;
      grid-template-columns: 1fr 2fr 1fr 1fr;
      padding: 12px;
      border-bottom: 1px solid #e5e7eb;
      font-size: 13px;
      color: #6b7280;

      &:last-child {
        border-bottom: none;
      }
    }

    .view-all {
      padding: 12px;
      background: #f9fafb;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      font-size: 13px;
      color: #6b7280;

      p {
        margin: 0;
      }
    }

    /* Help Section */
    .help-section {
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      border-radius: 8px;
      padding: 16px;
      margin-top: 20px;

      h4 {
        color: #1e40af;
        margin-top: 0;
      }

      ul {
        margin: 0;
        padding-left: 20px;
        font-size: 13px;
        color: #1e40af;

        li {
          margin-bottom: 8px;

          code {
            background: white;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: monospace;
            font-size: 12px;
          }
        }
      }
    }

    .btn {
      padding: 10px 16px;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;

      &.btn-primary {
        background: #3b82f6;
        color: white;

        &:hover:not(:disabled) {
          background: #2563eb;
        }

        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      }

      &.btn-secondary {
        background: #f3f4f6;
        color: #111827;
        border: 1px solid #d1d5db;

        &:hover:not(:disabled) {
          background: #e5e7eb;
        }

        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      }
    }
  `]
})
export class ExcelImportComponent {
  @Output() productImported = new EventEmitter<ExcelImportResponse>();

  private excelService: ExcelImportService = inject(ExcelImportService);
  private notificationService: NotificationService = inject(NotificationService);

  selectedFile = signal<File | null>(null);
  downloading = signal(false);
  validating = signal(false);
  importing = signal(false);
  fileValidated = signal(false);
  importCompleted = signal(false);
  validationError = signal<string | null>(null);
  validationSuccess = signal<string | null>(null);
  importResult = signal<ExcelImportResponse | null>(null);

  get templateColumns() {
    return this.excelService.getTemplateInfo().columns;
  }

  downloadTemplate(): void {
    this.downloading.set(true);
    console.log('📥 Starting template download...');
    
    this.excelService.downloadTemplate().subscribe({
      next: (blob: Blob) => {
        console.log('✅ Template downloaded, size:', blob.size, 'bytes');
        
        if (blob.size === 0) {
          console.error('❌ Downloaded file is empty');
          this.notificationService.error('Downloaded template is empty');
          this.downloading.set(false);
          return;
        }
        
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'product-import-template.xlsx';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        this.notificationService.success('Template downloaded successfully');
        this.downloading.set(false);
      },
      error: (err: any) => {
        console.error('❌ Download error:', err);
        console.error('Error status:', err.status);
        console.error('Error message:', err.message);
        
        let errorMsg = 'Failed to download template';
        if (err.status === 404) {
          errorMsg = 'Template endpoint not found (404)';
        } else if (err.status === 401) {
          errorMsg = 'Authentication required. Please login again.';
        } else if (err.status === 500) {
          errorMsg = 'Server error. Please try again later.';
        }
        
        this.notificationService.error(errorMsg);
        this.downloading.set(false);
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || !input.files[0]) return;

    const file = input.files[0];
    const validation = this.excelService.validateFile(file);

    if (!validation.valid) {
      this.notificationService.error(validation.error || 'Invalid file');
      this.selectedFile.set(null);
      return;
    }

    this.selectedFile.set(file);
    this.fileValidated.set(false);
    this.validationError.set(null);
    this.validationSuccess.set(null);
  }

  validateFile(): void {
    const file = this.selectedFile();
    
    if (!file) {
      this.notificationService.error('Please select a file first');
      return;
    }
    
    console.log('🔍 Validating file:', file.name, `(${(file.size / 1024).toFixed(2)} KB)`);
    if (!file) return;

    this.validating.set(true);
    
    this.excelService.validateExcelFile(file).subscribe({
      next: (response: ExcelValidationResponse) => {
        console.log('✅ Validation response:', response);
        
        if (response.valid) {
          this.fileValidated.set(true);
          this.validationSuccess.set('✓ File is valid and ready to import');
          this.validationError.set(null);
          this.notificationService.success('File validation passed');
        } else {
          this.fileValidated.set(false);
          this.validationError.set(response.message);
          this.notificationService.error(response.message);
        }
        this.validating.set(false);
      },
      error: (err: any) => {
        console.error('❌ Validation error:', err);
        console.error('Error status:', err.status);
        console.error('Error body:', err.error);
        
        let errorMsg = 'Failed to validate file';
        if (err.status === 400) {
          errorMsg = err.error?.message || 'Invalid Excel file format';
        } else if (err.status === 401) {
          errorMsg = 'Authentication required';
        }
        
        this.validationError.set(errorMsg);
        this.fileValidated.set(false);
        this.notificationService.error(errorMsg);
        this.validating.set(false);
      }
    });
  }

  importExcel(): void {
    const file = this.selectedFile();
    if (!file || !this.fileValidated()) return;

    console.log('📤 Starting Excel import for file:', file.name);
    this.importing.set(true);
    
    this.excelService.importProductsFromExcel(file).subscribe({
      next: (response: ExcelImportResponse) => {
        console.log('✅ Import response:', response);
        console.log('Success count:', response.successCount);
        console.log('Error count:', response.errorCount);
        
        this.importResult.set(response);
        this.importCompleted.set(true);
        this.productImported.emit(response);

        if (response.success) {
          this.notificationService.success(
            `Successfully imported ${response.successCount} products`
          );
        }

        if (response.errorCount > 0) {
          console.warn('Import errors:', response.errors);
          this.notificationService.warning(
            `${response.errorCount} products failed to import`
          );
        }

        this.importing.set(false);
      },
      error: (err: any) => {
        console.error('❌ Import error:', err);
        console.error('Error status:', err.status);
        console.error('Error body:', err.error);
        
        let errorMsg = 'Failed to import products';
        if (err.status === 400) {
          errorMsg = err.error?.message || 'Invalid Excel data';
        } else if (err.status === 401) {
          errorMsg = 'Authentication required';
        } else if (err.status === 500) {
          errorMsg = 'Server error during import';
        }
        
        this.notificationService.error(errorMsg);
        this.importing.set(false);
      }
    });
  }

  clearResults(): void {
    this.selectedFile.set(null);
    this.fileValidated.set(false);
    this.importCompleted.set(false);
    this.importResult.set(null);
    this.validationError.set(null);
    this.validationSuccess.set(null);
  }
}
