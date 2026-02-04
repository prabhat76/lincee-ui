import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatStepperModule } from '@angular/material/stepper';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CartService, CartItem } from '../../services/cart.service';
import { OrderService, OrderRequest } from '../../services/order.service';
import { AddressService } from '../../services/address.service';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatStepperModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss'
})
export class CheckoutComponent implements OnInit {
  shippingForm: FormGroup;
  paymentForm: FormGroup;
  cartItems = signal<CartItem[]>([]);
  cartTotal = signal(0);
  isLoading = signal(false);
  isPlacingOrder = signal(false);
  savedAddresses = signal<any[]>([]);
  selectedAddressId = signal<number | undefined>(undefined);

  constructor(
    private fb: FormBuilder,
    private cartService: CartService,
    private orderService: OrderService,
    private addressService: AddressService,
    private productService: ProductService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.shippingForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      addressLine1: ['', Validators.required],
      addressLine2: [''],
      city: ['', Validators.required],
      state: ['', Validators.required],
      postalCode: ['', [Validators.required, Validators.pattern(/^[0-9]{5,6}$/)]],
      country: ['USA', Validators.required]
    });

    this.paymentForm = this.fb.group({
      paymentMethod: ['COD', Validators.required]
    });
  }

  ngOnInit() {
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/checkout' } });
      return;
    }

    this.loadCart();
    this.loadSavedAddresses();
  }

  loadCart() {
    this.cartItems.set(this.cartService.getCartItems());
    this.cartTotal.set(this.cartService.getCartTotal());

    if (this.cartItems().length === 0) {
      this.snackBar.open('Your cart is empty', 'OK', { duration: 3000 });
      this.router.navigate(['/']);
    }
  }

  loadSavedAddresses() {
    const userId = localStorage.getItem('userId');
    if (userId) {
      this.addressService.getUserAddresses(parseInt(userId)).subscribe({
        next: (addresses) => {
          this.savedAddresses.set(addresses);
        },
        error: (error) => {
          console.error('Error loading addresses:', error);
        }
      });
    }
  }

  useAddress(address: any) {
    this.selectedAddressId.set(address.id);
    this.shippingForm.patchValue({
      addressLine1: address.street,
      city: address.city,
      state: address.state,
      postalCode: address.zipCode,
      country: 'USA'
    });
  }

  async placeOrder() {
    // Mark all fields as touched to show validation errors
    Object.keys(this.shippingForm.controls).forEach(key => {
      this.shippingForm.get(key)?.markAsTouched();
    });
    Object.keys(this.paymentForm.controls).forEach(key => {
      this.paymentForm.get(key)?.markAsTouched();
    });

    if (this.shippingForm.invalid) {
      this.snackBar.open('❌ Please fill in all required shipping information', 'OK', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
        panelClass: ['snackbar-error']
      });
      return;
    }

    if (this.paymentForm.invalid) {
      this.snackBar.open('❌ Please select a payment method', 'OK', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
        panelClass: ['snackbar-error']
      });
      return;
    }

    // Check if cart is empty
    if (this.cartItems().length === 0) {
      this.snackBar.open('❌ Your cart is empty', 'OK', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
        panelClass: ['snackbar-error']
      });
      this.router.navigate(['/products']);
      return;
    }

    this.isPlacingOrder.set(true);

    try {
      // Step 1: Validate stock availability
      const stockValidation = await this.validateStock();
      if (!stockValidation.valid) {
        this.snackBar.open(stockValidation.message!, 'OK', {
          duration: 4000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['snackbar-error']
        });
        this.isPlacingOrder.set(false);
        return;
      }

      // Step 2: Check authentication
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      
      if (!userId || !token) {
        this.snackBar.open('🔒 Session expired. Please login again.', 'LOGIN', {
          duration: 4000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['snackbar-error']
        }).onAction().subscribe(() => {
          this.router.navigate(['/login'], { queryParams: { returnUrl: '/checkout' } });
        });
        this.isPlacingOrder.set(false);
        return;
      }

      // Step 3: Create/Get Address ID
      let addressId = this.selectedAddressId();
      
      if (!addressId) {
        // Create new address
        const addressData = {
          type: 'SHIPPING',
          addressLine1: this.shippingForm.value.addressLine1,
          addressLine2: this.shippingForm.value.addressLine2 || '',
          city: this.shippingForm.value.city,
          state: this.shippingForm.value.state,
          zipCode: this.shippingForm.value.postalCode,
          country: this.shippingForm.value.country,
          phoneNumber: this.shippingForm.value.phone,
          isDefault: false
        };

        try {
          console.log('Creating address with data:', addressData);
          const address: any = await this.addressService.createAddress(addressData).toPromise();
          console.log('Address created successfully:', address);
          addressId = address.id;
        } catch (error: any) {
          console.error('Error creating address:', error);
          console.error('Address error details:', error.error);
          console.error('Address error status:', error.status);
          // If address creation fails, use default ID 1
          addressId = 1;
        }
      }

      // Step 4: Calculate total amount
      const totalAmount = this.cartItems().reduce((sum, item) => {
        return sum + (item.product.price * item.quantity);
      }, 0);

      // Step 5: Create Order with proper structure
      const orderData: OrderRequest = {
        userId: parseInt(userId),
        totalAmount: totalAmount,
        shippingAddressId: addressId,
        billingAddressId: addressId,
        paymentMethodId: 1, // Default payment method ID
        items: this.cartItems().map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
          size: item.size || 'M'
        })),
        shippingMethod: 'STANDARD',
        notes: `Payment: ${this.paymentForm.value.paymentMethod}, Contact: ${this.shippingForm.value.email}, Phone: ${this.shippingForm.value.phone}`
      };

      console.log('Creating order with data:', orderData);

      this.orderService.createOrder(orderData).subscribe({
        next: async (response) => {
          console.log('Order placed successfully:', response);
          
          // Update stock quantities
          try {
            await this.updateProductStocks();
          } catch (error) {
            console.error('Error updating stock:', error);
          }

          // Clear cart
          this.cartService.clearCart();

          // Show success and redirect
          this.isPlacingOrder.set(false);
          this.snackBar.open(
            `✓ Order placed successfully! Order #${response.id || 'PENDING'}`,
            'VIEW ORDERS',
            {
              duration: 5000,
              horizontalPosition: 'end',
              verticalPosition: 'top',
              panelClass: ['snackbar-success']
            }
          ).onAction().subscribe(() => {
            this.router.navigate(['/account']);
          });
          
          // Redirect after short delay
          setTimeout(() => {
            this.router.navigate(['/account']);
          }, 2000);
        },
        error: (error) => {
          console.error('Error placing order:', error);
          console.error('Error status:', error.status);
          console.error('Error message:', error.message);
          console.error('Error details:', error.error);
          console.error('Error response body:', JSON.stringify(error.error, null, 2));
          this.isPlacingOrder.set(false);
          
          // Check if it's an auth error
          if (error.status === 401 || error.status === 403) {
            this.snackBar.open('🔒 Authentication failed. Please login again.', 'LOGIN', {
              duration: 4000,
              horizontalPosition: 'end',
              verticalPosition: 'top',
              panelClass: ['snackbar-error']
            }).onAction().subscribe(() => {
              this.router.navigate(['/login'], { queryParams: { returnUrl: '/checkout' } });
            });
            return;
          }

          // Show specific error message
          const errorMessage = error.error?.message || error.message || 'Failed to place order. Please try again.';
          this.snackBar.open(`❌ ${errorMessage}`, 'OK', {
            duration: 5000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: ['snackbar-error']
          });
        }
      });
    } catch (error) {
      this.isPlacingOrder.set(false);
      console.error('Error in order process:', error);
      this.snackBar.open('❌ An error occurred. Please try again.', 'OK', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
        panelClass: ['snackbar-error']
      });
    }
  }

  private validateStock(): Promise<{ valid: boolean; message?: string }> {
    return new Promise((resolve) => {
      const items = this.cartItems();
      let invalidItems: string[] = [];

      // Check each item's current stock
      items.forEach(item => {
        if (item.quantity > item.product.stockQuantity) {
          invalidItems.push(`${item.product.name} (${item.quantity} requested, ${item.product.stockQuantity} available)`);
        }
      });

      if (invalidItems.length > 0) {
        resolve({
          valid: false,
          message: `Stock unavailable for: ${invalidItems.join(', ')}`
        });
      } else {
        resolve({ valid: true });
      }
    });
  }

  private updateProductStocks(): Promise<void> {
    const updatePromises = this.cartItems().map(item => {
      const newStock = item.product.stockQuantity - item.quantity;
      return this.productService.updateProduct(item.product.id, {
        ...item.product,
        stockQuantity: newStock
      }).toPromise();
    });

    return Promise.all(updatePromises).then(() => {});
  }

  getOrderSummary() {
    return {
      subtotal: this.cartTotal(),
      shipping: 0,
      tax: 0,
      total: this.cartTotal()
    };
  }

  getItemSubtotal(item: CartItem): number {
    return item.product.price * item.quantity;
  }
}
