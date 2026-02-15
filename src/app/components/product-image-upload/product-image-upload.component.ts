import { Component, EventEmitter, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ImageUploadService, ProductImage } from '../../services/image-upload.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-product-image-upload',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="image-upload-container">
      <h3>Product Images</h3>
      <p class="subtitle">Upload product images for different views (front, back, side, detail, lifestyle)</p>

      <!-- View Selection and Upload -->
      <div class="upload-section">
        <div class="upload-controls">
          <select [(ngModel)]="selectedView" class="view-select">
            <option value="">Select View Type</option>
            <option *ngFor="let view of availableViews" [value]="view">
              {{ view | titlecase }}
            </option>
          </select>

          <label class="file-input-label">
            <span class="btn btn-primary">{{ uploadingView() ? 'Uploading...' : 'Choose Image' }}</span>
            <input
              type="file"
              (change)="onFileSelected($event)"
              accept="image/*"
              [disabled]="uploadingView() !== null"
              class="file-input"
            />
          </label>
        </div>

        <!-- Preview -->
        <div class="preview-section" *ngIf="previewUrl()">
          <div class="preview-image">
            <img [src]="previewUrl()" [alt]="selectedView" />
            <button type="button" class="btn-close" (click)="clearPreview()">×</button>
          </div>
          <button
            type="button"
            class="btn btn-primary"
            (click)="uploadImage()"
            [disabled]="uploadingView() !== null"
          >
            {{ uploadingView() ? 'Uploading...' : 'Upload' }}
          </button>
        </div>

        <!-- Upload Progress -->
        <div class="upload-progress" *ngIf="uploadingView()">
          <div class="progress-bar">
            <div class="progress-fill" [style.width.%]="uploadProgress()"></div>
          </div>
          <span class="progress-text">{{ uploadProgress() }}%</span>
        </div>
      </div>

      <!-- Uploaded Images Gallery -->
      <div class="images-gallery">
        <h4>Uploaded Images</h4>
        <div class="gallery-grid">
          <div class="image-card" *ngFor="let img of uploadedImages()">
            <div class="image-wrapper">
              <img [src]="img.url" [alt]="img.view" />
              <div class="image-overlay">
                <button class="btn-delete" (click)="removeImage(img.view)">Delete</button>
              </div>
            </div>
            <div class="image-info">
              <span class="view-badge">{{ img.view | titlecase }}</span>
              <button
                type="button"
                class="btn-primary-small"
                (click)="setAsPrimary(img.view)"
                [class.active]="img.isPrimary"
              >
                {{ img.isPrimary ? '★ Primary' : 'Set as Primary' }}
              </button>
            </div>
          </div>
        </div>
        <div class="empty-state" *ngIf="uploadedImages().length === 0">
          <p>No images uploaded yet. Upload images to get started.</p>
        </div>
      </div>

      <!-- Selected Images Summary -->
      <div class="selected-images-summary">
        <h4>Selected Images for Product ({{ uploadedImages().length }})</h4>
        <div class="summary-list">
          <div class="summary-item" *ngFor="let img of uploadedImages()">
            <span class="view-name">{{ img.view | titlecase }}</span>
            <span class="primary-badge" *ngIf="img.isPrimary">Primary</span>
            <span class="url-preview">{{ img.url.substring(0, 50) }}...</span>
          </div>
        </div>
      </div>

      <!-- Hidden output signal -->
      <div [hidden]="true">
        {{ uploadedImagesJSON() }}
      </div>
    </div>
  `,
  styles: [`
    .image-upload-container {
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
      margin: 0 0 16px 0;
    }

    .upload-section {
      background: white;
      border: 2px dashed #d1d5db;
      border-radius: 8px;
      padding: 24px;
      margin-bottom: 24px;
    }

    .upload-controls {
      display: flex;
      gap: 12px;
      margin-bottom: 16px;
    }

    .view-select {
      flex: 1;
      padding: 10px 12px;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-size: 14px;
      background: white;
      cursor: pointer;

      &:focus {
        outline: none;
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      }
    }

    .file-input-label {
      display: flex;
      align-items: center;
      cursor: pointer;
    }

    .file-input {
      display: none;

      &:disabled + .btn {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }

    .preview-section {
      display: flex;
      gap: 16px;
      align-items: flex-start;
      margin-bottom: 16px;
    }

    .preview-image {
      position: relative;
      width: 200px;
      height: 200px;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      overflow: hidden;
      background: #f3f4f6;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .btn-close {
        position: absolute;
        top: 4px;
        right: 4px;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: rgba(0, 0, 0, 0.6);
        color: white;
        border: none;
        cursor: pointer;
        font-size: 20px;
        display: flex;
        align-items: center;
        justify-content: center;

        &:hover {
          background: rgba(0, 0, 0, 0.8);
        }
      }
    }

    .upload-progress {
      margin-top: 16px;
    }

    .progress-bar {
      width: 100%;
      height: 8px;
      background: #e5e7eb;
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 8px;

      .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #3b82f6, #2563eb);
        transition: width 0.3s ease;
      }
    }

    .progress-text {
      font-size: 12px;
      color: #6b7280;
    }

    .images-gallery {
      margin-bottom: 24px;

      h4 {
        font-size: 16px;
        font-weight: 600;
        color: #111827;
        margin: 0 0 16px 0;
      }
    }

    .gallery-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 16px;
      margin-bottom: 16px;
    }

    .image-card {
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      overflow: hidden;
      background: white;
    }

    .image-wrapper {
      position: relative;
      width: 100%;
      padding-bottom: 100%;
      overflow: hidden;
      background: #f3f4f6;

      img {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .image-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.3s;

        .btn-delete {
          padding: 8px 16px;
          background: #ef4444;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;

          &:hover {
            background: #dc2626;
          }
        }
      }

      &:hover .image-overlay {
        opacity: 1;
      }
    }

    .image-info {
      padding: 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }

    .view-badge {
      display: inline-block;
      padding: 4px 8px;
      background: #e0e7ff;
      color: #3730a3;
      font-size: 12px;
      font-weight: 600;
      border-radius: 4px;
      text-transform: uppercase;
      flex-shrink: 0;
    }

    .btn-primary-small {
      padding: 4px 8px;
      background: white;
      color: #3b82f6;
      border: 1px solid #3b82f6;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
      font-weight: 500;
      transition: all 0.2s;

      &:hover:not(.active) {
        background: #eff6ff;
      }

      &.active {
        background: #fbbf24;
        color: #78350f;
        border-color: #fbbf24;
      }
    }

    .empty-state {
      text-align: center;
      padding: 32px 16px;
      color: #9ca3af;
      background: #f9fafb;
      border-radius: 8px;

      p {
        margin: 0;
      }
    }

    .selected-images-summary {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: 8px;
      padding: 16px;
    }

    .selected-images-summary h4 {
      font-size: 14px;
      font-weight: 600;
      color: #15803d;
      margin: 0 0 12px 0;
    }

    .summary-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .summary-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px;
      background: white;
      border-radius: 4px;
      font-size: 13px;

      .view-name {
        font-weight: 600;
        color: #111827;
        min-width: 70px;
      }

      .primary-badge {
        padding: 2px 6px;
        background: #fbbf24;
        color: #78350f;
        border-radius: 3px;
        font-size: 11px;
        font-weight: 600;
      }

      .url-preview {
        flex: 1;
        color: #6b7280;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
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

        &:hover {
          background: #e5e7eb;
        }
      }
    }
  `]
})
export class ProductImageUploadComponent {
  @Output() imagesSelected = new EventEmitter<ProductImage[]>();

  private imageUploadService = inject(ImageUploadService);
  private notificationService = inject(NotificationService);

  selectedView = '';
  availableViews = this.imageUploadService.getAvailableViews();
  
  uploadedImages = signal<ProductImage[]>([]);
  previewUrl = signal<string | null>(null);
  uploadProgress = signal(0);
  uploadingView = signal<string | null>(null);

  get uploadedImagesJSON() {
    return () => JSON.stringify(this.uploadedImages());
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || !input.files[0]) return;

    const file = input.files[0];

    if (!this.selectedView) {
      this.notificationService.error('Please select a view type first');
      return;
    }

    const validation = this.imageUploadService.validateImage(file);
    if (!validation.valid) {
      this.notificationService.error(validation.error || 'Invalid image');
      return;
    }

    const url = this.imageUploadService.createPreviewUrl(file);
    this.previewUrl.set(url);
  }

  uploadImage(): void {
    if (!this.previewUrl() || !this.selectedView) return;

    const input = document.querySelector('.file-input') as HTMLInputElement;
    if (!input.files || !input.files[0]) return;

    const file = input.files[0];
    this.uploadingView.set(this.selectedView);

    this.imageUploadService.uploadSingleImage(file, this.selectedView).subscribe({
      next: (response: any) => {
        const result = response.body || response;
        const newImage: ProductImage = {
          view: this.selectedView,
          url: result.url,
          isPrimary: this.uploadedImages().length === 0
        };

        this.uploadedImages.update(images => [...images, newImage]);
        this.imagesSelected.emit(this.uploadedImages());
        
        this.notificationService.success(`Image uploaded for ${this.selectedView} view`);
        this.clearForm();
      },
      error: (err: any) => {
        console.error('Upload error:', err);
        this.notificationService.error('Failed to upload image');
        this.uploadingView.set(null);
      }
    });
  }

  removeImage(view: string): void {
    this.uploadedImages.update(images => {
      const filtered = images.filter(img => img.view !== view);
      const hasPrimary = filtered.some(img => img.isPrimary);
      
      if (!hasPrimary && filtered.length > 0) {
        filtered[0].isPrimary = true;
      }
      
      return filtered;
    });
    this.imagesSelected.emit(this.uploadedImages());
    this.notificationService.success('Image removed');
  }

  setAsPrimary(view: string): void {
    this.uploadedImages.update(images =>
      images.map(img => ({
        ...img,
        isPrimary: img.view === view
      }))
    );
    this.imagesSelected.emit(this.uploadedImages());
  }

  clearPreview(): void {
    const url = this.previewUrl();
    if (url) {
      this.imageUploadService.revokePreviewUrl(url);
    }
    this.previewUrl.set(null);
    const input = document.querySelector('.file-input') as HTMLInputElement;
    if (input) input.value = '';
  }

  private clearForm(): void {
    this.clearPreview();
    this.selectedView = '';
    this.uploadingView.set(null);
    this.uploadProgress.set(0);
  }
}
