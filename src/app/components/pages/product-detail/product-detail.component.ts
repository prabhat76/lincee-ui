import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ProductService, Product, ProductImage } from '../../../services/product.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="product-detail-page">
      <div class="container" *ngIf="product()">
        <div class="product-container">
          <!-- Image Gallery Section -->
          <div class="image-gallery-section">
            <!-- Main Image -->
            <div class="main-image-container">
              <img 
                [src]="selectedImage()" 
                [alt]="selectedImageView() || product()!.name"
                class="main-image"
              />
              <div class="image-view-badge" *ngIf="selectedImageView()">
                {{ selectedImageView() | titlecase }}
              </div>
            </div>

            <!-- Thumbnail Views -->
            <div class="image-thumbnails" *ngIf="availableViews().length > 1">
              <h4>Available Views</h4>
              <div class="thumbnails-grid">
                <button
                  *ngFor="let view of availableViews()"
                  class="thumbnail"
                  [class.active]="selectedImageView() === view"
                  (click)="selectImageView(view)"
                  [attr.title]="view | titlecase"
                >
                  <img 
                    [src]="getImageUrlForView(view)" 
                    [alt]="view | titlecase"
                  />
                  <span class="view-label">{{ view | titlecase }}</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Product Info Section -->
          <div class="product-info-section">
            <h1>{{ product()!.name }}</h1>
            <p class="category">{{ product()!.category }}</p>
            <p class="price">{{ product()!.price | currency }}</p>
            <p class="description">{{ product()!.description }}</p>

            <!-- Available Images Info -->
            <div class="images-info" *ngIf="hasProductImages()">
              <h4>Product Images</h4>
              <div class="images-list">
                <div class="image-item" *ngFor="let img of getProductImages()">
                  <span class="view-badge">{{ img.view | titlecase }}</span>
                  <span class="primary-badge" *ngIf="img.isPrimary">★ Primary</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="loading" *ngIf="loading()">Loading product...</div>
      <div class="error" *ngIf="error()">{{ error() }}</div>
    </div>
  `,
  styles: [`
    .product-detail-page {
      padding: 40px 0 80px;
      background: var(--color-background);
      color: var(--color-text);
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 20px;
    }

    .product-container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 48px;
      background: var(--color-surface);
      border-radius: 16px;
      padding: 32px;
      border: 1px solid var(--color-border);
    }

    .image-gallery-section {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .main-image-container {
      position: relative;
      width: 100%;
      padding-bottom: 100%;
      background: #f9fafb;
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid var(--color-border);
    }

    .main-image {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .image-view-badge {
      position: absolute;
      top: 12px;
      right: 12px;
      padding: 8px 12px;
      background: rgba(0, 0, 0, 0.6);
      color: white;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
    }

    .image-thumbnails {
      h4 {
        font-size: 14px;
        font-weight: 600;
        color: var(--color-text);
        margin: 0 0 12px 0;
      }
    }

    .thumbnails-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
      gap: 12px;
    }

    .thumbnail {
      position: relative;
      width: 100%;
      padding-bottom: 100%;
      border: 2px solid transparent;
      border-radius: 8px;
      overflow: hidden;
      background: #f9fafb;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        border-color: var(--color-primary);
      }

      &.active {
        border-color: var(--color-primary);
        box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb), 0.1);
      }

      img {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .view-label {
        position: absolute;
        bottom: 4px;
        left: 0;
        right: 0;
        background: rgba(0, 0, 0, 0.4);
        color: white;
        font-size: 10px;
        font-weight: 600;
        text-align: center;
        padding: 2px 0;
        text-transform: uppercase;
      }
    }

    .product-info-section {
      display: flex;
      flex-direction: column;
      gap: 20px;

      h1 {
        font-size: 28px;
        font-weight: 700;
        color: var(--color-text);
        margin: 0;
      }

      .category {
        font-size: 14px;
        color: var(--color-text-light);
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin: 0;
      }

      .price {
        font-size: 32px;
        font-weight: 700;
        color: var(--color-primary);
        margin: 0;
      }

      .description {
        font-size: 16px;
        line-height: 1.6;
        color: var(--color-text);
        margin: 0;
      }
    }

    .images-info {
      margin-top: 20px;
      padding: 16px;
      background: rgba(var(--color-primary-rgb), 0.05);
      border-radius: 8px;
      border: 1px solid rgba(var(--color-primary-rgb), 0.1);

      h4 {
        font-size: 14px;
        font-weight: 600;
        color: var(--color-text);
        margin: 0 0 12px 0;
      }
    }

    .images-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .image-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px;
      background: white;
      border-radius: 4px;
      font-size: 13px;
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
    }

    .primary-badge {
      padding: 4px 8px;
      background: #fbbf24;
      color: #78350f;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
    }

    .loading,
    .error {
      text-align: center;
      padding: 40px 20px;
      font-size: 16px;
    }

    .error {
      color: #ef4444;
    }

    @media (max-width: 768px) {
      .product-container {
        grid-template-columns: 1fr;
        gap: 24px;
        padding: 20px;
      }

      .product-info-section h1 {
        font-size: 24px;
      }

      .product-info-section .price {
        font-size: 24px;
      }
    }
  `]
})
export class ProductDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);

  product = signal<Product | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);
  selectedImageView = signal<string | null>(null);
  selectedImage = signal<string>('');

  ngOnInit() {
    this.route.params.subscribe(params => {
      const productId = params['id'];
      if (productId) {
        this.loadProduct(productId);
      }
    });
  }

  loadProduct(id: number) {
    this.loading.set(true);
    this.productService.getProduct(id).subscribe({
      next: (product) => {
        this.product.set(product);
        // Set default primary or first image
        if (product.productImages && product.productImages.length > 0) {
          const primaryImage = product.productImages.find(img => img.isPrimary);
          if (primaryImage) {
            this.selectImageView(primaryImage.view);
          } else {
            this.selectImageView(product.productImages[0].view);
          }
        } else if (product.images && product.images.length > 0) {
          this.selectedImage.set(product.images[0]);
        }
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load product:', err);
        this.error.set('Failed to load product details');
        this.loading.set(false);
      }
    });
  }

  availableViews() {
    const product = this.product();
    return product?.productImages?.map(img => img.view) || [];
  }

  hasProductImages(): boolean {
    const product = this.product();
    return !!(product?.productImages && product.productImages.length > 0);
  }

  getProductImages(): ProductImage[] {
    const product = this.product();
    return product?.productImages || [];
  }

  selectImageView(view: string) {
    const product = this.product();
    if (product?.productImages) {
      const imageData = product.productImages.find(img => img.view === view);
      if (imageData) {
        this.selectedImageView.set(view);
        this.selectedImage.set(imageData.url);
      }
    }
  }

  getImageUrlForView(view: string): string {
    const product = this.product();
    if (product?.productImages) {
      const imageData = product.productImages.find(img => img.view === view);
      return imageData?.url || '';
    }
    return '';
  }
}
