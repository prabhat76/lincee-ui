import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { AddressService } from '../../services/address.service';
import { OrderService } from '../../services/order.service';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatTabsModule,
    MatDialogModule,
    MatSnackBarModule,
    MatSelectModule
  ],
  templateUrl: './account.html',
  styleUrl: './account.scss'
})
export class AccountComponent implements OnInit {
  user = signal<any>(null);
  addresses = signal<any[]>([]);
  orders = signal<any[]>([]);
  isLoading = signal(true);
  activeTab = signal(0);
  isEditingProfile = signal(false);
  isEditingAddress = signal(false);
  editingAddressId = signal<number | null>(null);
  selectedAddress = signal<any>(null);
  
  profileForm: FormGroup;
  addressForm: FormGroup;
  userId: string | null = null;
  userRole: string | null = null;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private addressService: AddressService,
    private orderService: OrderService,
    private router: Router,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.pattern(/^[0-9]{10}$/)]]
    });

    this.addressForm = this.fb.group({
      street: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      zipCode: ['', [Validators.required, Validators.pattern(/^[0-9]{5,6}$/)]],
      country: ['India', Validators.required],
      addressType: ['SHIPPING', Validators.required],
      isDefault: [false]
    });
  }

  ngOnInit() {
    // Check authentication
    this.userId = localStorage.getItem('userId');
    this.userRole = localStorage.getItem('userRole');
    
    if (!this.userId) {
      this.router.navigate(['/login']);
      return;
    }

    this.loadUserProfile();
    this.loadAddresses();
    this.loadOrders();
  }

  loadUserProfile() {
    if (!this.userId) return;

    this.userService.getUserById(this.userId).subscribe({
      next: (user: any) => {
        this.user.set(user);
        this.profileForm.patchValue({
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email || '',
          phoneNumber: user.phoneNumber || ''
        });
        this.isLoading.set(false);
      },
      error: (error: any) => {
        console.error('Failed to load user profile:', error);
        this.showNotification('Failed to load profile', 'error');
        this.isLoading.set(false);
      }
    });
  }

  loadAddresses() {
    if (!this.userId) return;

    this.addressService.getUserAddresses(parseInt(this.userId)).subscribe({
      next: (addresses: any) => {
        this.addresses.set(Array.isArray(addresses) ? addresses : []);
      },
      error: (error: any) => {
        console.error('Failed to load addresses:', error);
      }
    });
  }

  loadOrders() {
    if (!this.userId) return;

    this.orderService.getUserOrders(parseInt(this.userId)).subscribe({
      next: (response: any) => {
        const orders = response.content || response || [];
        this.orders.set(Array.isArray(orders) ? orders : []);
      },
      error: (error: any) => {
        console.error('Failed to load orders:', error);
      }
    });
  }

  onProfileSubmit() {
    if (this.profileForm.invalid || !this.userId) {
      this.showNotification('Please fill all required fields correctly', 'error');
      return;
    }

    const updatedData = this.profileForm.value;
    this.isLoading.set(true);

    this.userService.update(this.userId, updatedData).subscribe({
      next: (user: any) => {
        this.user.set(user);
        this.isEditingProfile.set(false);
        this.isLoading.set(false);
        this.showNotification('Profile updated successfully', 'success');
      },
      error: (error: any) => {
        console.error('Failed to update profile:', error);
        this.isLoading.set(false);
        this.showNotification('Failed to update profile', 'error');
      }
    });
  }

  toggleEditProfile() {
    this.isEditingProfile.set(!this.isEditingProfile());
    if (!this.isEditingProfile()) {
      // Reset form to original values
      const user = this.user();
      if (user) {
        this.profileForm.patchValue({
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email || '',
          phoneNumber: user.phoneNumber || ''
        });
      }
    }
  }

  // Address Management
  openAddressForm(address?: any) {
    if (address) {
      this.isEditingAddress.set(true);
      this.editingAddressId.set(address.id);
      this.addressForm.patchValue({
        street: address.street || '',
        city: address.city || '',
        state: address.state || '',
        zipCode: address.zipCode || '',
        country: address.country || 'India',
        addressType: address.addressType || 'SHIPPING',
        isDefault: address.isDefault || false
      });
    } else {
      this.isEditingAddress.set(false);
      this.editingAddressId.set(null);
      this.addressForm.reset({
        country: 'India',
        addressType: 'SHIPPING',
        isDefault: false
      });
    }
  }

  onAddressSubmit() {
    if (this.addressForm.invalid || !this.userId) {
      this.showNotification('Please fill all required fields correctly', 'error');
      return;
    }

    const addressData = this.addressForm.value;
    this.isLoading.set(true);

    if (this.isEditingAddress() && this.editingAddressId()) {
      // Update existing address
      this.addressService.updateAddress(this.editingAddressId()!, addressData).subscribe({
        next: () => {
          this.isLoading.set(false);
          this.showNotification('Address updated successfully', 'success');
          this.loadAddresses();
          this.cancelAddressForm();
        },
        error: (error: any) => {
          console.error('Failed to update address:', error);
          this.isLoading.set(false);
          this.showNotification('Failed to update address', 'error');
        }
      });
    } else {
      // Add new address
      this.addressService.addAddress(parseInt(this.userId), addressData).subscribe({
        next: () => {
          this.isLoading.set(false);
          this.showNotification('Address added successfully', 'success');
          this.loadAddresses();
          this.cancelAddressForm();
        },
        error: (error: any) => {
          console.error('Failed to add address:', error);
          this.isLoading.set(false);
          this.showNotification('Failed to add address', 'error');
        }
      });
    }
  }

  cancelAddressForm() {
    this.isEditingAddress.set(false);
    this.editingAddressId.set(null);
    this.addressForm.reset({
      country: 'India',
      addressType: 'SHIPPING',
      isDefault: false
    });
  }

  deleteAddress(id: number) {
    if (!confirm('Are you sure you want to delete this address?')) {
      return;
    }

    this.addressService.deleteAddress(id).subscribe({
      next: () => {
        this.showNotification('Address deleted successfully', 'success');
        this.loadAddresses();
      },
      error: (error: any) => {
        console.error('Failed to delete address:', error);
        this.showNotification('Failed to delete address', 'error');
      }
    });
  }

  viewAddressDetails(address: any) {
    this.selectedAddress.set(address);
  }

  closeAddressDetails() {
    this.selectedAddress.set(null);
  }

  getOrderStatusClass(status: string): string {
    switch (status?.toUpperCase()) {
      case 'DELIVERED':
        return 'status-delivered';
      case 'SHIPPED':
      case 'PROCESSING':
        return 'status-processing';
      case 'CANCELLED':
        return 'status-cancelled';
      default:
        return 'status-pending';
    }
  }

  navigateToAdmin() {
    if (this.userRole === 'ADMIN') {
      this.router.navigate(['/admin']);
    }
  }

  showNotification(message: string, type: 'success' | 'error' | 'info') {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: [`snackbar-${type}`]
    });
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        // Clear all authentication data
        localStorage.removeItem('authToken');
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('userRole');
        localStorage.removeItem('isAdmin');
        localStorage.removeItem('username');
        this.router.navigate(['/']);
      },
      error: () => {
        // Clear data even if API call fails
        localStorage.removeItem('authToken');
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('userRole');
        localStorage.removeItem('isAdmin');
        localStorage.removeItem('username');
        this.router.navigate(['/']);
      }
    });
  }
}
