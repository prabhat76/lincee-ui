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
import { MatSnackBarModule } from '@angular/material/snack-bar';

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
    MatSnackBarModule
  ],
  templateUrl: './admin.html',
  styleUrl: './admin.scss'
})
export class AdminComponent implements OnInit {
  productForm: FormGroup;
  isLoading = signal(false);
  successMessage = signal('');
  errorMessage = signal('');
  products = signal<any[]>([]);
  activeTab = signal(0);
  isEditMode = signal(false);
  editingProductId = signal<number | null>(null);

  displayedColumns = ['id', 'name', 'price', 'category', 'stock', 'actions'];
  categories = ['HOODIES', 'TSHIRTS', 'JACKETS', 'ACCESSORIES', 'HATS', 'SHOES'];

  constructor(
    private fb: FormBuilder,
    private router: Router
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
  }

  ngOnInit() {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    
    if (!token || userRole !== 'ADMIN') {
      this.router.navigate(['/']);
    }
    
    this.loadProducts();
  }

  loadProducts() {
    // Mock data - replace with actual API call
    this.products.set([
      {
        id: 1,
        name: 'Classic Streetwear Hoodie',
        description: 'Premium quality cotton hoodie',
        price: 79.99,
        category: 'HOODIES',
        stock: 50,
        brand: 'Lincee',
        featured: true
      },
      {
        id: 2,
        name: 'Urban T-Shirt',
        description: 'Comfortable cotton t-shirt',
        price: 29.99,
        category: 'TSHIRTS',
        stock: 100,
        brand: 'Lincee',
        featured: false
      }
    ]);
  }

  onSubmit() {
    if (this.productForm.invalid) {
      this.errorMessage.set('Please fill in all required fields');
      return;
    }

    this.isLoading.set(true);
    this.successMessage.set('');
    this.errorMessage.set('');

    const productData = {
      ...this.productForm.value,
      sizes: this.productForm.value.sizes.split(',').map((s: string) => s.trim()),
      colors: this.productForm.value.colors.split(',').map((c: string) => c.trim())
    };

    if (this.isEditMode() && this.editingProductId()) {
      // Update product
      setTimeout(() => {
        this.isLoading.set(false);
        this.successMessage.set(`Product "${productData.name}" updated successfully!`);
        this.resetForm();
        this.loadProducts();
      }, 1000);
    } else {
      // Create new product
      setTimeout(() => {
        this.isLoading.set(false);
        this.successMessage.set(`Product "${productData.name}" added successfully!`);
        this.resetForm();
        this.loadProducts();
      }, 1000);
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

  deleteProduct(id: number, name: string) {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      this.isLoading.set(true);
      setTimeout(() => {
        this.isLoading.set(false);
        this.successMessage.set(`Product "${name}" deleted successfully!`);
        this.loadProducts();
      }, 500);
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
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userRole');
    this.router.navigate(['/']);
  }
}
