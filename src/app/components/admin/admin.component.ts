import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ProductService } from '../../services/product.service';
import { CollectionService, Collection, CreateCollectionRequest } from '../../services/collection.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTabsModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCardModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTooltipModule
  ],
  templateUrl: './admin.html',
  styleUrl: './admin.scss'
})
export class AdminComponent implements OnInit {
  productForm: FormGroup;
  collectionForm: FormGroup;
  isLoading = signal(false);
  successMessage = signal('');
  errorMessage = signal('');
  products = signal<any[]>([]);
  collections = signal<Collection[]>([]);
  activeTab = signal(0);
  isEditMode = signal(false);
  editingProductId = signal<number | null>(null);
  isEditCollectionMode = signal(false);
  editingCollectionId = signal<number | null>(null);
  selectedCollection = signal<Collection | null>(null);
  showCollectionDetails = signal(false);
  availableProducts = signal<any[]>([]);
  selectedProductIds = signal<number[]>([]);
  isDarkMode = signal(false);
  selectedImages = signal<Array<{file: File, preview: string}>>([]);

  displayedColumns = ['id', 'name', 'price', 'category', 'stock', 'actions'];
  collectionColumns = ['id', 'name', 'slug', 'productCount', 'featured', 'active', 'actions'];
  categories = ['HOODIES', 'TSHIRTS', 'JACKETS', 'ACCESSORIES', 'HATS', 'SHOES'];
  searchQuery = signal('');
  selectedProduct = signal<any>(null);
  showProductDetails = signal(false);

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private productService: ProductService,
    private collectionService: CollectionService,
    private snackBar: MatSnackBar
  ) {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      price: ['', [Validators.required, Validators.min(0.01)]],
      category: ['', Validators.required],
      brand: ['', [Validators.required, Validators.minLength(2)]],
      stock: ['', [Validators.required, Validators.min(0)]],
      sizes: ['S,M,L,XL'],
      colors: ['Black,White,Gray'],
      imageUrl: [''],
      featured: [false]
    });

    this.collectionForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      slug: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      description: [''],
      imageUrl: [''],
      active: [true],
      featured: [false],
      displayOrder: [0, [Validators.min(0)]]
    });
  }

  ngOnInit() {
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    const userRole = localStorage.getItem('userRole');
    
    // Check both isAdmin flag and role for security
    if (!token || !isAdmin || userRole !== 'ADMIN') {
      this.router.navigate(['/']);
      return;
    }

    // Load theme preference
    const savedTheme = localStorage.getItem('adminTheme');
    this.isDarkMode.set(savedTheme === 'dark');
    this.applyTheme();

    this.loadProducts();
    this.loadCollections();
  }

  toggleTheme() {
    this.isDarkMode.update(v => !v);
    this.applyTheme();
    localStorage.setItem('adminTheme', this.isDarkMode() ? 'dark' : 'light');
  }

  applyTheme() {
    const adminContainer = document.querySelector('.admin-container');
    if (adminContainer) {
      if (this.isDarkMode()) {
        adminContainer.classList.add('dark-mode');
        adminContainer.classList.remove('light-mode');
      } else {
        adminContainer.classList.add('light-mode');
        adminContainer.classList.remove('dark-mode');
      }
    }
  }

  loadProducts() {
    this.isLoading.set(true);
    this.productService.getAllProducts().subscribe({
      next: (response) => {
        this.isLoading.set(false);
        // API returns array directly
        const products = response.map((p: any) => ({
          id: p.id,
          name: p.name,
          description: p.description,
          price: p.price,
          category: p.category,
          stock: p.stockQuantity,
          brand: p.brand || 'Lincee',
          sizes: p.availableSizes || [],
          colors: p.availableColors || [],
          imageUrl: p.imageUrls?.[0] || '',
          featured: p.featured || p.isFeatured || false,
          active: p.active !== undefined ? p.active : (p.isActive !== undefined ? p.isActive : true)
        }));
        this.products.set(products);
      },
      error: (error) => {
        this.isLoading.set(false);
        this.showNotification('Failed to load products', 'error');
        console.error('Error loading products:', error);
      }
    });
  }

  onSubmit() {
    if (this.productForm.invalid) {
      this.errorMessage.set('Please fill in all required fields');
      return;
    }

    this.isLoading.set(true);
    this.successMessage.set('');
    this.errorMessage.set('');

    const formValue = this.productForm.value;
    const productData = {
      name: formValue.name,
      description: formValue.description,
      price: parseFloat(formValue.price),
      category: formValue.category,
      brand: formValue.brand,
      stockQuantity: parseInt(formValue.stock),
      availableSizes: formValue.sizes.split(',').map((s: string) => s.trim()).filter((s: string) => s),
      colors: formValue.colors.split(',').map((c: string) => c.trim()).filter((c: string) => c),
      imageUrls: formValue.imageUrl ? [formValue.imageUrl] : [],
      isFeatured: formValue.featured || false,
      isActive: true
    };

    if (this.isEditMode() && this.editingProductId()) {
      // Update product
      this.productService.updateProduct(this.editingProductId()!, productData).subscribe({
        next: (response) => {
          this.isLoading.set(false);
          this.successMessage.set(`Product "${productData.name}" updated successfully!`);
          this.showNotification(`Product "${productData.name}" updated successfully!`, 'success');
          this.resetForm();
          this.loadProducts();
        },
        error: (error) => {
          this.isLoading.set(false);
          this.errorMessage.set('Failed to update product. Please try again.');
          this.showNotification('Failed to update product', 'error');
          console.error('Error updating product:', error);
        }
      });
    } else {
      // Create new product
      this.productService.createProduct(productData).subscribe({
        next: (response) => {
          this.isLoading.set(false);
          this.successMessage.set(`Product "${productData.name}" added successfully!`);
          this.showNotification(`Product "${productData.name}" added successfully!`, 'success');
          this.resetForm();
          this.loadProducts();
        },
        error: (error) => {
          this.isLoading.set(false);
          this.errorMessage.set('Failed to add product. Please try again.');
          this.showNotification('Failed to add product', 'error');
          console.error('Error adding product:', error);
        }
      });
    }
  }

  editProduct(product: any) {
    this.isEditMode.set(true);
    this.editingProductId.set(product.id);
    this.activeTab.set(0);
    
    this.productForm.patchValue({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      brand: product.brand,
      stock: product.stock,
      sizes: product.sizes?.join(',') || 'S,M,L,XL',
      colors: product.colors?.join(',') || 'Black,White,Gray',
      featured: product.featured || false
    });
  }

  onImageSelected(event: any) {
    const files = event.target.files;
    if (files && files.length > 0) {
      const newImages: Array<{file: File, preview: string}> = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
          this.showNotification('Please select only image files', 'error');
          continue;
        }
        
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          this.showNotification(`Image ${file.name} is too large. Max size is 5MB`, 'error');
          continue;
        }
        
        // Create preview
        const reader = new FileReader();
        reader.onload = (e: any) => {
          newImages.push({
            file: file,
            preview: e.target.result
          });
          
          // Update signal after all files are read
          if (newImages.length === files.length || i === files.length - 1) {
            this.selectedImages.update(current => [...current, ...newImages]);
          }
        };
        reader.readAsDataURL(file);
      }
    }
  }

  removeImage(index: number) {
    this.selectedImages.update(images => images.filter((_, i) => i !== index));
  }

  deleteProduct(id: number, name: string) {
    if (confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      this.isLoading.set(true);
      this.productService.deleteProduct(id).subscribe({
        next: () => {
          this.isLoading.set(false);
          this.showNotification(`Product "${name}" deleted successfully!`, 'success');
          this.loadProducts();
        },
        error: (error) => {
          this.isLoading.set(false);
          this.showNotification('Failed to delete product', 'error');
          console.error('Error deleting product:', error);
        }
      });
    }
  }

  resetForm() {
    this.productForm.reset({
      sizes: 'S,M,L,XL',
      colors: 'Black,White,Gray',
      featured: false
    });
    this.isEditMode.set(false);
    this.editingProductId.set(null);
    this.selectedImages.set([]);
  }

  getInStockCount(): number {
    return this.products().filter(p => p.stock > 0).length;
  }

  getOutOfStockCount(): number {
    return this.products().filter(p => p.stock === 0).length;
  }

  getTotalInventoryValue(): string {
    const total = this.products().reduce((sum, p) => sum + (p.price || 0), 0);
    return total.toFixed(2);
  }

  getCategoryCount(category: string): number {
    return this.products().filter(p => p.category === category).length;
  }

  viewProductDetails(product: any) {
    this.selectedProduct.set(product);
    this.showProductDetails.set(true);
  }

  closeProductDetails() {
    this.showProductDetails.set(false);
    this.selectedProduct.set(null);
  }

  searchProducts() {
    const query = this.searchQuery().trim();
    if (query) {
      this.isLoading.set(true);
      this.productService.searchProducts(query).subscribe({
        next: (response) => {
          this.isLoading.set(false);
          // API returns array directly
          const products = response.map((p: any) => ({
            id: p.id,
            name: p.name,
            description: p.description,
            price: p.price,
            category: p.category,
            stock: p.stockQuantity,
            brand: p.brand || 'Lincee',
            sizes: p.availableSizes || [],
            colors: p.availableColors || [],
            imageUrl: p.imageUrls?.[0] || '',
            featured: p.featured || p.isFeatured || false,
            active: p.active !== undefined ? p.active : (p.isActive !== undefined ? p.isActive : true)
          }));
          this.products.set(products);
        },
        error: (error) => {
          this.isLoading.set(false);
          this.showNotification('Search failed', 'error');
        }
      });
    } else {
      this.loadProducts();
    }
  }

  clearSearch() {
    this.searchQuery.set('');
    this.loadProducts();
  }

  showNotification(message: string, type: 'success' | 'error' | 'info') {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: [`snackbar-${type}`]
    });
  }

  // Collection Management Methods
  loadCollections() {
    this.isLoading.set(true);
    this.collectionService.getAllCollections().subscribe({
      next: (collections) => {
        this.collections.set(collections);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.isLoading.set(false);
        this.showNotification('Failed to load collections', 'error');
        console.error('Error loading collections:', error);
      }
    });
  }

  onCollectionSubmit() {
    if (this.collectionForm.invalid) {
      this.showNotification('Please fill in all required fields', 'error');
      return;
    }

    this.isLoading.set(true);
    const collectionData: CreateCollectionRequest = this.collectionForm.value;

    if (this.isEditCollectionMode() && this.editingCollectionId()) {
      this.collectionService.updateCollection(this.editingCollectionId()!, collectionData).subscribe({
        next: (response) => {
          this.isLoading.set(false);
          this.showNotification(`Collection "${collectionData.name}" updated successfully!`, 'success');
          this.resetCollectionForm();
          this.loadCollections();
        },
        error: (error) => {
          this.isLoading.set(false);
          this.showNotification('Failed to update collection', 'error');
          console.error('Error updating collection:', error);
        }
      });
    } else {
      this.collectionService.createCollection(collectionData).subscribe({
        next: (response) => {
          this.isLoading.set(false);
          this.showNotification(`Collection "${collectionData.name}" created successfully!`, 'success');
          this.resetCollectionForm();
          this.loadCollections();
        },
        error: (error) => {
          this.isLoading.set(false);
          this.showNotification('Failed to create collection', 'error');
          console.error('Error creating collection:', error);
        }
      });
    }
  }

  editCollection(collection: Collection) {
    this.isEditCollectionMode.set(true);
    this.editingCollectionId.set(collection.id);
    this.activeTab.set(3); // Collections tab
    
    this.collectionForm.patchValue({
      name: collection.name,
      slug: collection.slug,
      description: collection.description || '',
      imageUrl: collection.imageUrl || '',
      active: collection.active,
      featured: collection.featured,
      displayOrder: collection.displayOrder
    });
  }

  deleteCollection(id: number, name: string) {
    if (confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      this.isLoading.set(true);
      this.collectionService.deleteCollection(id).subscribe({
        next: () => {
          this.isLoading.set(false);
          this.showNotification(`Collection "${name}" deleted successfully!`, 'success');
          this.loadCollections();
        },
        error: (error) => {
          this.isLoading.set(false);
          this.showNotification('Failed to delete collection', 'error');
          console.error('Error deleting collection:', error);
        }
      });
    }
  }

  resetCollectionForm() {
    this.collectionForm.reset({
      active: true,
      featured: false,
      displayOrder: 0
    });
    this.isEditCollectionMode.set(false);
    this.editingCollectionId.set(null);
  }

  viewCollectionDetails(collection: Collection) {
    this.collectionService.getCollectionById(collection.id).subscribe({
      next: (data) => {
        this.selectedCollection.set(data);
        this.showCollectionDetails.set(true);
      },
      error: (error) => {
        this.showNotification('Failed to load collection details', 'error');
        console.error('Error loading collection details:', error);
      }
    });
  }

  closeCollectionDetails() {
    this.showCollectionDetails.set(false);
    this.selectedCollection.set(null);
  }

  manageCollectionProducts(collection: Collection) {
    this.selectedCollection.set(collection);
    this.loadProducts();
    this.selectedProductIds.set(collection.products?.map(p => p.id) || []);
  }

  toggleProductSelection(productId: number) {
    const selected = this.selectedProductIds();
    const index = selected.indexOf(productId);
    
    if (index > -1) {
      selected.splice(index, 1);
    } else {
      selected.push(productId);
    }
    
    this.selectedProductIds.set([...selected]);
  }

  isProductSelected(productId: number): boolean {
    return this.selectedProductIds().includes(productId);
  }

  saveCollectionProducts() {
    const collection = this.selectedCollection();
    if (!collection) return;

    const currentProductIds = collection.products?.map(p => p.id) || [];
    const newProductIds = this.selectedProductIds();
    
    // Find products to add and remove
    const toAdd = newProductIds.filter(id => !currentProductIds.includes(id));
    const toRemove = currentProductIds.filter(id => !newProductIds.includes(id));

    this.isLoading.set(true);

    // Add new products
    if (toAdd.length > 0) {
      this.collectionService.addMultipleProducts(collection.id, toAdd).subscribe({
        next: () => {
          this.handleProductRemoval(collection.id, toRemove);
        },
        error: (error) => {
          this.isLoading.set(false);
          this.showNotification('Failed to add products', 'error');
        }
      });
    } else {
      this.handleProductRemoval(collection.id, toRemove);
    }
  }

  private handleProductRemoval(collectionId: number, toRemove: number[]) {
    if (toRemove.length > 0) {
      let completed = 0;
      toRemove.forEach(productId => {
        this.collectionService.removeProductFromCollection(collectionId, productId).subscribe({
          next: () => {
            completed++;
            if (completed === toRemove.length) {
              this.finishProductUpdate();
            }
          },
          error: (error) => {
            this.isLoading.set(false);
            this.showNotification('Failed to remove some products', 'error');
          }
        });
      });
    } else {
      this.finishProductUpdate();
    }
  }

  private finishProductUpdate() {
    this.isLoading.set(false);
    this.showNotification('Collection products updated successfully!', 'success');
    this.selectedCollection.set(null);
    this.selectedProductIds.set([]);
    this.loadCollections();
  }

  generateSlug() {
    const name = this.collectionForm.get('name')?.value;
    if (name) {
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      this.collectionForm.patchValue({ slug });
    }
  }

  logout() {
    // Clear all authentication data
    localStorage.removeItem('authToken');
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userRole');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('username');
    localStorage.removeItem('adminTheme');
    this.router.navigate(['/']);
  }
}
