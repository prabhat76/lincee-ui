import { Component, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductService, Product, ProductImage } from '../../services/product.service';
import { NotificationService } from '../../services/notification.service';
import { ProductImageUploadComponent } from '../product-image-upload/product-image-upload.component';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ProductImageUploadComponent],
  template: `
    <form [formGroup]="productForm" (ngSubmit)="submitProduct()" class="product-form">
      <div class="form-row">
        <input 
          formControlName="name" 
          placeholder="Product name" 
          [class.error]="isFieldTouched('name') && productForm.get('name')?.invalid"
        />
        <input 
          formControlName="price" 
          type="number" 
          placeholder="Price" 
          [class.error]="isFieldTouched('price') && productForm.get('price')?.invalid"
        />
      </div>

      <div class="form-row">
        <input 
          formControlName="category" 
          placeholder="Category"
          [class.error]="isFieldTouched('category') && productForm.get('category')?.invalid"
        />
        <input 
          formControlName="imageUrl" 
          placeholder="Image URL (or use upload below)" 
        />
      </div>

      <textarea 
        formControlName="description" 
        rows="3" 
        placeholder="Description"
        [class.error]="isFieldTouched('description') && productForm.get('description')?.invalid"
      ></textarea>

      <!-- Image Upload Component -->
      <div class="image-upload-section">
        <button 
          type="button" 
          class="btn btn-secondary" 
          (click)="showImageUpload.set(!showImageUpload())"
        >
          {{ showImageUpload() ? 'Hide Image Upload' : 'Show Image Upload' }}
        </button>
        <app-product-image-upload 
          *ngIf="showImageUpload()"
          (imagesSelected)="onImagesSelected($event)"
        >
        </app-product-image-upload>
      </div>

      <!-- Form Actions -->
      <div class="form-actions">
        <button 
          class="btn btn-primary" 
          type="submit"
          [disabled]="isSubmitting()"
        >
          {{ isSubmitting() ? 'Saving...' : (editingProduct() ? 'Update Product' : 'Create Product') }}
        </button>
        <button 
          class="btn btn-secondary" 
          type="button" 
          (click)="resetForm()"
          [disabled]="isSubmitting()"
        >
          Clear
        </button>
      </div>

      <!-- Validation Errors -->
      <div class="form-errors" *ngIf="showValidationErrors()">
        <div class="error-message" *ngIf="productForm.get('name')?.invalid">
          Product name is required
        </div>
        <div class="error-message" *ngIf="productForm.get('price')?.hasError('required')">
          Price is required
        </div>
        <div class="error-message" *ngIf="productForm.get('price')?.hasError('min')">
          Price must be greater than 0
        </div>
        <div class="error-message" *ngIf="productForm.get('description')?.invalid">
          Description is required
        </div>
        <div class="error-message" *ngIf="productForm.get('category')?.invalid">
          Category is required
        </div>
      </div>
    </form>
  `,
  styles: [`
    .product-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
      padding: 20px;
      background: #f9f9f9;
      border-radius: 8px;
      margin-bottom: 30px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
    }

    input, textarea {
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-family: inherit;
      font-size: 14px;
      transition: border-color 0.3s;

      &:focus {
        outline: none;
        border-color: #4CAF50;
        box-shadow: 0 0 5px rgba(76, 175, 80, 0.3);
      }

      &.error {
        border-color: #f44336;
        background-color: #ffebee;
      }
    }

    textarea {
      grid-column: 1 / -1;
      resize: vertical;
    }

    .image-upload-section {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .form-actions {
      display: flex;
      gap: 10px;
    }

    .btn {
      padding: 12px 24px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s;
      flex: 1;

      &.btn-primary {
        background: #4CAF50;
        color: white;

        &:hover:not(:disabled) {
          background: #45a049;
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }

        &:disabled {
          background: #ccc;
          cursor: not-allowed;
          opacity: 0.6;
        }
      }

      &.btn-secondary {
        background: #2196F3;
        color: white;

        &:hover:not(:disabled) {
          background: #0b7dda;
        }

        &:disabled {
          background: #ccc;
          cursor: not-allowed;
          opacity: 0.6;
        }
      }
    }

    .form-errors {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 12px;
      background: #ffebee;
      border-left: 4px solid #f44336;
      border-radius: 4px;
    }

    .error-message {
      color: #f44336;
      font-size: 14px;
      font-weight: 500;
    }

    @media (max-width: 768px) {
      .form-row {
        grid-template-columns: 1fr;
      }

      .form-actions {
        flex-direction: column;
      }
    }
  `]
})
export class ProductFormComponent {
  private fb = inject(FormBuilder);
  private productService = inject(ProductService);
  private notificationService = inject(NotificationService);

  editingProduct = input<Product | null>(null);
  productSubmitted = output<{ isUpdate: boolean; product: Product }>();
  formReset = output<void>();

  showImageUpload = signal(false);
  showValidationErrors = signal(false);
  isSubmitting = signal(false);
  selectedProductImages = signal<ProductImage[]>([]);

  productForm = this.fb.group({
    id: [null as number | null],
    name: ['', Validators.required],
    price: [0, [Validators.required, Validators.min(0)]],
    description: ['', Validators.required],
    category: ['', Validators.required],
    imageUrl: ['']
  });

  constructor() {
    // Watch for changes to editingProduct input
    const product = this.editingProduct();
    if (product) {
      this.loadProductIntoForm(product);
    }
  }

  loadProductIntoForm(product: Product) {
    this.productForm.patchValue({
      id: product.id,
      name: product.name,
      price: product.price,
      description: product.description,
      category: product.category || '',
      imageUrl: product.images?.[0] || ''
    });
    this.selectedProductImages.set(product.productImages || []);
    this.showImageUpload.set(true);
  }

  submitProduct() {
    this.showValidationErrors.set(true);

    if (this.productForm.invalid) {
      this.notificationService.error('Please fill in all required fields');
      return;
    }

    this.isSubmitting.set(true);
    const { id, name, price, description, category, imageUrl } = this.productForm.value;

    // Build image URLs from uploaded images
    const imageUrls: string[] = [];
    const uploadedImages = this.selectedProductImages();

    if (uploadedImages.length > 0) {
      imageUrls.push(...uploadedImages.map(img => img.url));
    } else if (imageUrl) {
      imageUrls.push(imageUrl);
    }

    const payload = {
      name: name || '',
      price: Number(price || 0),
      description: description || '',
      category: category || 'Other',
      imageUrls: imageUrls.length > 0 ? imageUrls : [],
      productImages: uploadedImages.length > 0 ? uploadedImages : undefined
    };

    if (id) {
      // Update existing product
      this.productService.updateProduct(id, payload).subscribe({
        next: (updatedProduct) => {
          this.notificationService.success(`Product "${name}" updated successfully!`);
          this.productSubmitted.emit({ isUpdate: true, product: updatedProduct });
          this.resetForm();
          this.isSubmitting.set(false);
        },
        error: (err) => {
          console.error('Update error:', err);
          this.notificationService.error('Failed to update product.');
          this.isSubmitting.set(false);
        }
      });
    } else {
      // Create new product
      this.productService.createProduct(payload).subscribe({
        next: (newProduct) => {
          this.notificationService.success(`Product "${name}" created successfully!`);
          this.productSubmitted.emit({ isUpdate: false, product: newProduct });
          this.resetForm();
          this.isSubmitting.set(false);
        },
        error: (err) => {
          console.error('Create error:', err);
          this.notificationService.error('Failed to create product.');
          this.isSubmitting.set(false);
        }
      });
    }
  }

  resetForm() {
    this.productForm.reset({ id: null, name: '', price: 0, description: '', category: '', imageUrl: '' });
    this.selectedProductImages.set([]);
    this.showImageUpload.set(false);
    this.showValidationErrors.set(false);
    this.formReset.emit();
  }

  onImagesSelected(images: ProductImage[]): void {
    this.selectedProductImages.set(images);
  }

  isFieldTouched(fieldName: string): boolean {
    const field = this.productForm.get(fieldName);
    return !!(field && field.touched);
  }
}
