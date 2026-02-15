import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BannerService, Banner } from '../../services/banner.service';
import { NotificationService } from '../../services/notification.service';
import { ImageUploadService } from '../../services/image-upload.service';

@Component({
  selector: 'app-banner-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="banner-management">
      <div class="header">
        <h2>🎨 Banner Management</h2>
        <button class="btn btn-primary" (click)="showCreateForm()">
          + Add New Banner
        </button>
      </div>

      <!-- Banner Form -->
      <div class="form-section" *ngIf="showForm()">
        <h3>{{ editingBanner() ? 'Edit' : 'Create' }} Banner</h3>
        <form [formGroup]="bannerForm" (ngSubmit)="saveBanner()">
          <div class="form-grid">
            <div class="form-group">
              <label>Title *</label>
              <input formControlName="title" placeholder="New Season Drop" />
              <span class="error" *ngIf="bannerForm.get('title')?.invalid && bannerForm.get('title')?.touched">
                Title is required
              </span>
            </div>

            <div class="form-group">
              <label>Subtitle</label>
              <input formControlName="subtitle" placeholder="Explore our latest collection" />
            </div>

            <div class="form-group">
              <label>Position *</label>
              <select formControlName="position">
                <option value="hero">Hero Banner (Main)</option>
                <option value="secondary">Secondary Banner</option>
                <option value="promotional">Promotional Banner</option>
              </select>
            </div>

            <div class="form-group">
              <label>Display Order</label>
              <input type="number" formControlName="displayOrder" min="0" />
            </div>

            <div class="form-group full-width">
              <label>Button Text</label>
              <input formControlName="buttonText" placeholder="Shop Now" />
            </div>

            <div class="form-group full-width">
              <label>Button Link</label>
              <input formControlName="link" placeholder="/products" />
            </div>

            <div class="form-group">
              <label>Start Date (Optional)</label>
              <input type="date" formControlName="startDate" />
            </div>

            <div class="form-group">
              <label>End Date (Optional)</label>
              <input type="date" formControlName="endDate" />
            </div>
          </div>

          <!-- Image Upload -->
          <div class="image-section">
            <label>Banner Image *</label>
            <div class="image-upload-wrapper">
              <div class="current-image" *ngIf="bannerForm.get('imageUrl')?.value">
                <img [src]="bannerForm.get('imageUrl')?.value" alt="Current banner" />
              </div>
              <div class="upload-controls">
                <label class="file-input-label">
                  <span class="btn btn-secondary">{{ uploading() ? 'Uploading...' : 'Choose Image' }}</span>
                  <input
                    type="file"
                    (change)="onImageSelected($event)"
                    accept="image/*"
                    [disabled]="uploading()"
                    class="file-input"
                  />
                </label>
                <p class="help-text">Recommended: 1920x600px, Max 5MB</p>
              </div>
            </div>
            <span class="error" *ngIf="!bannerForm.get('imageUrl')?.value && bannerForm.touched">
              Banner image is required
            </span>
          </div>

          <!-- Active Toggle -->
          <div class="toggle-section">
            <label class="toggle-label">
              <input type="checkbox" formControlName="isActive" />
              <span>Active (visible on website)</span>
            </label>
          </div>

          <!-- Actions -->
          <div class="form-actions">
            <button type="button" class="btn btn-secondary" (click)="cancelForm()">Cancel</button>
            <button type="submit" class="btn btn-primary" [disabled]="bannerForm.invalid || saving()">
              {{ saving() ? 'Saving...' : 'Save Banner' }}
            </button>
          </div>
        </form>
      </div>

      <!-- Banners List -->
      <div class="banners-list">
        <h3>Current Banners ({{ banners().length }})</h3>
        
        <div class="loading" *ngIf="loading()">Loading banners...</div>

        <div class="banner-cards" *ngIf="!loading()">
          <div class="banner-card" *ngFor="let banner of banners()" [class.inactive]="!banner.isActive">
            <div class="banner-preview">
              <img [src]="banner.imageUrl" [alt]="banner.title" />
              <div class="banner-overlay">
                <span class="position-badge">{{ banner.position }}</span>
                <span class="status-badge" [class.active]="banner.isActive">
                  {{ banner.isActive ? 'Active' : 'Inactive' }}
                </span>
              </div>
            </div>

            <div class="banner-info">
              <h4>{{ banner.title }}</h4>
              <p *ngIf="banner.subtitle">{{ banner.subtitle }}</p>
              <div class="meta">
                <span>Order: {{ banner.displayOrder }}</span>
                <span *ngIf="banner.buttonText">Button: "{{ banner.buttonText }}"</span>
              </div>
              <div class="dates" *ngIf="banner.startDate || banner.endDate">
                <small *ngIf="banner.startDate">From: {{ banner.startDate | date:'short' }}</small>
                <small *ngIf="banner.endDate">To: {{ banner.endDate | date:'short' }}</small>
              </div>
            </div>

            <div class="banner-actions">
              <button class="btn-icon" (click)="toggleBannerStatus(banner)" title="Toggle active status">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              </button>
              <button class="btn-icon" (click)="editBanner(banner)" title="Edit">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </button>
              <button class="btn-icon danger" (click)="deleteBanner(banner)" title="Delete">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
              </button>
            </div>
          </div>

          <div class="empty-state" *ngIf="banners().length === 0">
            <p>No banners created yet. Click "Add New Banner" to get started.</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .banner-management {
      padding: 20px;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid var(--color-border);
    }

    .form-section {
      background: var(--color-surface);
      padding: 30px;
      border-radius: 8px;
      margin-bottom: 40px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 20px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
    }

    .form-group.full-width {
      grid-column: 1 / -1;
    }

    .form-group label {
      font-weight: 600;
      margin-bottom: 8px;
      color: var(--color-text);
    }

    .form-group input,
    .form-group select {
      padding: 12px;
      border: 1px solid var(--color-border);
      border-radius: 4px;
      background: var(--color-background);
      color: var(--color-text);
      font-size: 14px;
    }

    .error {
      color: #ef4444;
      font-size: 12px;
      margin-top: 4px;
    }

    .image-section {
      margin: 30px 0;
      padding: 20px;
      background: var(--color-background);
      border-radius: 4px;
    }

    .image-upload-wrapper {
      display: flex;
      gap: 20px;
      align-items: flex-start;
    }

    .current-image {
      flex: 1;
      max-width: 300px;
    }

    .current-image img {
      width: 100%;
      height: auto;
      border-radius: 4px;
      border: 2px solid var(--color-border);
    }

    .upload-controls {
      flex: 1;
    }

    .file-input {
      display: none;
    }

    .file-input-label {
      display: inline-block;
      cursor: pointer;
    }

    .help-text {
      margin-top: 8px;
      font-size: 12px;
      color: var(--color-text-light);
    }

    .toggle-section {
      margin: 20px 0;
    }

    .toggle-label {
      display: flex;
      align-items: center;
      gap: 10px;
      cursor: pointer;
      font-weight: 600;
    }

    .toggle-label input[type="checkbox"] {
      width: 40px;
      height: 20px;
      cursor: pointer;
    }

    .form-actions {
      display: flex;
      gap: 15px;
      justify-content: flex-end;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid var(--color-border);
    }

    .banner-cards {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 20px;
    }

    .banner-card {
      background: var(--color-surface);
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      transition: transform 0.2s;
    }

    .banner-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    .banner-card.inactive {
      opacity: 0.6;
    }

    .banner-preview {
      position: relative;
      height: 200px;
      overflow: hidden;
    }

    .banner-preview img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .banner-overlay {
      position: absolute;
      top: 10px;
      right: 10px;
      display: flex;
      gap: 8px;
    }

    .position-badge,
    .status-badge {
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      background: rgba(0,0,0,0.7);
      color: white;
    }

    .status-badge.active {
      background: #10b981;
    }

    .banner-info {
      padding: 20px;
    }

    .banner-info h4 {
      margin: 0 0 8px 0;
      font-size: 18px;
    }

    .banner-info p {
      margin: 0 0 12px 0;
      color: var(--color-text-light);
      font-size: 14px;
    }

    .meta {
      display: flex;
      gap: 15px;
      font-size: 12px;
      color: var(--color-text-light);
      margin-bottom: 8px;
    }

    .dates {
      display: flex;
      flex-direction: column;
      gap: 4px;
      font-size: 11px;
      color: var(--color-text-light);
    }

    .banner-actions {
      display: flex;
      gap: 10px;
      padding: 15px 20px;
      border-top: 1px solid var(--color-border);
      background: var(--color-background);
    }

    .btn-icon {
      background: transparent;
      border: 1px solid var(--color-border);
      padding: 8px;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-icon:hover {
      background: var(--color-primary);
      border-color: var(--color-primary);
      color: white;
    }

    .btn-icon:hover svg {
      stroke: white;
    }

    .btn-icon.danger:hover {
      background: #ef4444;
      border-color: #ef4444;
    }

    .empty-state {
      text-align: center;
      padding: 60px 20px;
      color: var(--color-text-light);
    }

    .loading {
      text-align: center;
      padding: 40px;
      color: var(--color-text-light);
    }

    @media (max-width: 768px) {
      .form-grid {
        grid-template-columns: 1fr;
      }

      .banner-cards {
        grid-template-columns: 1fr;
      }

      .image-upload-wrapper {
        flex-direction: column;
      }
    }
  `]
})
export class BannerManagementComponent implements OnInit {
  private fb = inject(FormBuilder);
  private bannerService = inject(BannerService);
  private notificationService = inject(NotificationService);
  private imageUploadService = inject(ImageUploadService);

  banners = signal<Banner[]>([]);
  loading = signal(false);
  saving = signal(false);
  uploading = signal(false);
  showForm = signal(false);
  editingBanner = signal<Banner | null>(null);

  bannerForm = this.fb.group({
    title: ['', Validators.required],
    subtitle: [''],
    imageUrl: ['', Validators.required],
    position: ['hero', Validators.required],
    link: [''],
    buttonText: [''],
    isActive: [true],
    displayOrder: [0, [Validators.required, Validators.min(0)]],
    startDate: [''],
    endDate: ['']
  });

  ngOnInit() {
    this.loadBanners();
  }

  loadBanners() {
    this.loading.set(true);
    this.bannerService.getAllBanners().subscribe({
      next: (banners) => {
        this.banners.set(banners);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load banners:', err);
        this.notificationService.error('Failed to load banners');
        this.loading.set(false);
      }
    });
  }

  showCreateForm() {
    this.showForm.set(true);
    this.editingBanner.set(null);
    this.bannerForm.reset({
      isActive: true,
      position: 'hero',
      displayOrder: 0
    });
  }

  editBanner(banner: Banner) {
    this.showForm.set(true);
    this.editingBanner.set(banner);
    this.bannerForm.patchValue({
      title: banner.title,
      subtitle: banner.subtitle || '',
      imageUrl: banner.imageUrl,
      position: banner.position,
      link: banner.link || '',
      buttonText: banner.buttonText || '',
      isActive: banner.isActive,
      displayOrder: banner.displayOrder,
      startDate: banner.startDate ? new Date(banner.startDate).toISOString().split('T')[0] : '',
      endDate: banner.endDate ? new Date(banner.endDate).toISOString().split('T')[0] : ''
    });
  }

  onImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || !input.files[0]) return;

    const file = input.files[0];
    const validation = this.imageUploadService.validateImage(file);

    if (!validation.valid) {
      this.notificationService.error(validation.error || 'Invalid image');
      return;
    }

    this.uploading.set(true);
    console.log('🖼️ Starting banner image upload...');
    
    this.imageUploadService.uploadSingleImage(file, 'banners').subscribe({
      next: (response: any) => {
        console.log('✅ Banner upload response:', response);
        
        // Handle different response structures
        let imageUrl: string;
        if (typeof response === 'string') {
          imageUrl = response;
        } else if (response.url) {
          imageUrl = response.url;
        } else if (response.body?.url) {
          imageUrl = response.body.url;
        } else {
          console.error('Unexpected response format:', response);
          this.notificationService.error('Invalid upload response');
          this.uploading.set(false);
          return;
        }
        
        this.bannerForm.patchValue({ imageUrl });
        this.notificationService.success('Image uploaded successfully');
        this.uploading.set(false);
      },
      error: (err) => {
        console.error('❌ Banner upload error:', err);
        console.error('Error details:', JSON.stringify(err, null, 2));
        
        const errorMsg = err.error?.message || err.message || 'Failed to upload image';
        this.notificationService.error(errorMsg);
        this.uploading.set(false);
      }
    });
  }

  saveBanner() {
    if (this.bannerForm.invalid) return;

    this.saving.set(true);
    const formValue = this.bannerForm.value;
    const bannerData: Partial<Banner> = {
      title: formValue.title!,
      subtitle: formValue.subtitle || undefined,
      imageUrl: formValue.imageUrl!,
      position: formValue.position as any,
      link: formValue.link || undefined,
      buttonText: formValue.buttonText || undefined,
      isActive: formValue.isActive!,
      displayOrder: formValue.displayOrder!,
      startDate: formValue.startDate ? new Date(formValue.startDate) : undefined,
      endDate: formValue.endDate ? new Date(formValue.endDate) : undefined
    };

    const request = this.editingBanner()
      ? this.bannerService.updateBanner(this.editingBanner()!.id, bannerData)
      : this.bannerService.createBanner(bannerData);

    request.subscribe({
      next: () => {
        this.notificationService.success(`Banner ${this.editingBanner() ? 'updated' : 'created'} successfully`);
        this.loadBanners();
        this.cancelForm();
        this.saving.set(false);
      },
      error: (err) => {
        console.error('Save error:', err);
        this.notificationService.error('Failed to save banner');
        this.saving.set(false);
      }
    });
  }

  toggleBannerStatus(banner: Banner) {
    this.bannerService.toggleBannerStatus(banner.id).subscribe({
      next: () => {
        this.notificationService.success(`Banner ${banner.isActive ? 'deactivated' : 'activated'}`);
        this.loadBanners();
      },
      error: (err) => {
        console.error('Toggle error:', err);
        this.notificationService.error('Failed to toggle banner status');
      }
    });
  }

  deleteBanner(banner: Banner) {
    if (!confirm(`Delete banner "${banner.title}"? This action cannot be undone.`)) return;

    this.bannerService.deleteBanner(banner.id).subscribe({
      next: () => {
        this.notificationService.success('Banner deleted successfully');
        this.loadBanners();
      },
      error: (err) => {
        console.error('Delete error:', err);
        this.notificationService.error('Failed to delete banner');
      }
    });
  }

  cancelForm() {
    this.showForm.set(false);
    this.editingBanner.set(null);
    this.bannerForm.reset();
  }
}
