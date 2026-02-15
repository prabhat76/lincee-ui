import { Component, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService, Product } from '../../services/product.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="product-list">
      <!-- Header -->
      <div class="list-header">
        <h3>Products ({{ products().length }} total)</h3>
        <div class="list-controls">
          <input 
            type="text" 
            placeholder="Search products..." 
            (input)="searchTerm.set($any($event.target).value)"
            class="search-input"
          />
          <button class="btn btn-secondary" (click)="toggleShowAll()">
            {{ showAllProducts() ? 'Show Less' : 'Show All' }}
          </button>
        </div>
      </div>

      <!-- Table -->
      <div class="table" *ngIf="!isLoading()">
        <div class="table-header">
          <span class="col-name">Name</span>
          <span class="col-price">Price</span>
          <span class="col-category">Category</span>
          <span class="col-actions">Actions</span>
        </div>

        <div class="table-row" *ngFor="let product of getDisplayedProducts(); let idx = index" [attr.data-product-id]="product.id">
          <span class="col-name">
            <strong>{{ product.name }}</strong>
            <small *ngIf="product.description" class="description">{{ product.description | slice:0:50 }}...</small>
          </span>
          <span class="col-price">{{ product.price | currency }}</span>
          <span class="col-category">
            <span class="category-badge">{{ product.category }}</span>
          </span>
          <div class="col-actions">
            <button 
              class="btn-text edit" 
              (click)="editProduct.emit(product)"
              title="Edit product"
            >
              ✎ Edit
            </button>
            <button 
              class="btn-text delete" 
              (click)="confirmDelete(product)"
              [disabled]="isDeleting() === product.id"
              title="Delete product"
            >
              {{ isDeleting() === product.id ? '...' : '🗑 Delete' }}
            </button>
          </div>
        </div>

        <!-- Empty State -->
        <div class="empty-state" *ngIf="getDisplayedProducts().length === 0">
          <p *ngIf="searchTerm()">No products match your search</p>
          <p *ngIf="!searchTerm()">No products available. Create your first product using the form above.</p>
        </div>
      </div>

      <!-- Loading State -->
      <div class="loading-state" *ngIf="isLoading()">
        <div class="spinner"></div>
        <p>Loading products...</p>
      </div>

      <!-- Delete Confirmation Modal -->
      <div class="modal-overlay" *ngIf="showDeleteConfirm()" (click)="cancelDelete()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <h4>Delete Product</h4>
          <p>Are you sure you want to delete <strong>"{{ productToDelete()?.name }}"</strong>?</p>
          <p class="warning">This action cannot be undone.</p>
          <div class="modal-actions">
            <button class="btn btn-secondary" (click)="cancelDelete()">
              Cancel
            </button>
            <button class="btn btn-danger" (click)="performDelete()">
              {{ isDeleting() === productToDelete()?.id ? 'Deleting...' : 'Delete Permanently' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .product-list {
      margin-top: 30px;
    }

    .list-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      flex-wrap: wrap;
      gap: 15px;

      h3 {
        margin: 0;
        font-size: 20px;
        color: #333;
      }
    }

    .list-controls {
      display: flex;
      gap: 10px;
      flex: 1;
      max-width: 500px;

      @media (max-width: 768px) {
        max-width: 100%;
        grid-column: 1 / -1;
      }
    }

    .search-input {
      flex: 1;
      padding: 10px 15px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;

      &:focus {
        outline: none;
        border-color: #4CAF50;
        box-shadow: 0 0 5px rgba(76, 175, 80, 0.3);
      }
    }

    .btn {
      padding: 10px 15px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s;

      &.btn-secondary {
        background: #2196F3;
        color: white;

        &:hover {
          background: #0b7dda;
        }

        &:disabled {
          background: #ccc;
          cursor: not-allowed;
        }
      }

      &.btn-danger {
        background: #f44336;
        color: white;

        &:hover:not(:disabled) {
          background: #da190b;
        }

        &:disabled {
          background: #ccc;
          cursor: not-allowed;
        }
      }
    }

    .table {
      border: 1px solid #ddd;
      border-radius: 8px;
      overflow: hidden;
      background: white;
    }

    .table-header {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1fr;
      gap: 15px;
      padding: 15px 20px;
      background: #f5f5f5;
      font-weight: 600;
      border-bottom: 2px solid #ddd;

      span {
        display: flex;
        align-items: center;
      }
    }

    .table-row {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1fr;
      gap: 15px;
      padding: 15px 20px;
      border-bottom: 1px solid #eee;
      align-items: center;
      transition: background-color 0.3s;

      &:hover {
        background-color: #fafafa;
      }

      &:last-child {
        border-bottom: none;
      }
    }

    .col-name {
      display: flex;
      flex-direction: column;
      gap: 5px;

      strong {
        color: #333;
      }

      .description {
        color: #999;
        font-size: 12px;
        font-weight: normal;
      }
    }

    .col-price {
      font-weight: 600;
      color: #4CAF50;
    }

    .col-category {
      display: flex;
      align-items: center;
    }

    .category-badge {
      display: inline-block;
      padding: 4px 12px;
      background: #e3f2fd;
      color: #1976d2;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
    }

    .col-actions {
      display: flex;
      gap: 8px;
    }

    .btn-text {
      padding: 6px 12px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
      font-size: 13px;
      transition: all 0.3s;
      background: transparent;

      &.edit {
        color: #2196F3;

        &:hover:not(:disabled) {
          background: #e3f2fd;
          transform: translateY(-1px);
        }
      }

      &.delete {
        color: #f44336;

        &:hover:not(:disabled) {
          background: #ffebee;
          transform: translateY(-1px);
        }

        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      }
    }

    .empty-state {
      padding: 40px 20px;
      text-align: center;
      color: #999;
      background: #f9f9f9;

      p {
        margin: 10px 0;
        font-size: 14px;
      }
    }

    .loading-state {
      padding: 40px 20px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 15px;

      .spinner {
        width: 40px;
        height: 40px;
        border: 4px solid #f3f3f3;
        border-top: 4px solid #4CAF50;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }

      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      p {
        color: #666;
        font-weight: 500;
      }
    }

    /* Modal Styles */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-content {
      background: white;
      padding: 30px;
      border-radius: 8px;
      max-width: 400px;
      width: 90%;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);

      h4 {
        margin: 0 0 15px 0;
        font-size: 18px;
        color: #333;
      }

      p {
        margin: 10px 0;
        color: #666;
        font-size: 14px;

        &.warning {
          color: #f44336;
          font-weight: 500;
        }
      }

      strong {
        color: #333;
      }
    }

    .modal-actions {
      display: flex;
      gap: 10px;
      margin-top: 25px;

      button {
        flex: 1;
        padding: 12px;
        border: none;
        border-radius: 4px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s;

        &.btn {
          &.btn-secondary {
            background: #e0e0e0;
            color: #333;

            &:hover {
              background: #d0d0d0;
            }
          }

          &.btn-danger {
            background: #f44336;
            color: white;

            &:hover:not(:disabled) {
              background: #da190b;
            }

            &:disabled {
              opacity: 0.6;
              cursor: not-allowed;
            }
          }
        }
      }
    }

    @media (max-width: 768px) {
      .table-header, .table-row {
        grid-template-columns: 1fr;
        gap: 10px;

        span {
          display: flex;
          gap: 5px;

          &::before {
            content: attr(data-label);
            font-weight: 600;
            min-width: 80px;
          }
        }
      }

      .table-header {
        display: none;
      }

      .table-row {
        padding: 15px;
        border: 1px solid #ddd;
        border-radius: 4px;
        margin-bottom: 10px;
      }

      .col-actions {
        flex-direction: column;

        button {
          width: 100%;
        }
      }
    }
  `]
})
export class ProductListComponent {
  private productService = inject(ProductService);
  private notificationService = inject(NotificationService);

  products = input<Product[]>([]);
  isLoading = input(false);

  editProduct = output<Product>();
  productDeleted = output<number>();

  showAllProducts = signal(false);
  searchTerm = signal('');
  isDeleting = signal<number | null>(null);
  showDeleteConfirm = signal(false);
  productToDelete = signal<Product | null>(null);

  getDisplayedProducts(): Product[] {
    const allProducts = this.products();
    const term = this.searchTerm().toLowerCase();

    // Filter by search term
    let filtered = term
      ? allProducts.filter(p => 
          p.name.toLowerCase().includes(term) ||
          p.category?.toLowerCase().includes(term) ||
          p.description?.toLowerCase().includes(term)
        )
      : allProducts;

    // Apply show all limit
    return this.showAllProducts() ? filtered : filtered.slice(0, 5);
  }

  toggleShowAll(): void {
    this.showAllProducts.set(!this.showAllProducts());
  }

  confirmDelete(product: Product): void {
    this.productToDelete.set(product);
    this.showDeleteConfirm.set(true);
  }

  cancelDelete(): void {
    this.showDeleteConfirm.set(false);
    this.productToDelete.set(null);
  }

  performDelete(): void {
    const product = this.productToDelete();
    if (!product || !product.id) return;

    this.isDeleting.set(product.id);

    this.productService.deleteProduct(product.id).subscribe({
      next: () => {
        this.notificationService.success(`Product "${product.name}" deleted successfully!`);
        this.productDeleted.emit(product.id);
        this.cancelDelete();
        this.isDeleting.set(null);
      },
      error: (err) => {
        console.error('Delete error:', err);
        this.notificationService.error(
          `Failed to delete product. Error: ${err?.error?.message || err?.message || 'Unknown error'}`
        );
        this.isDeleting.set(null);
      }
    });
  }
}
