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
  selectedAddressId = signal<number | null>(null);

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
      this.snackBar.open('Please fill in all required shipping information', 'OK', { duration: 3000 });
      return;
    }

    if (this.paymentForm.invalid) {
      this.snackBar.open('Please select a payment method', 'OK', { duration: 3000 });
      return;
    }

    this.isPlacingOrder.set(true);

    try {
      // Step 1: Validate stock availability
      const stockValidation = await this.validateStock();
      if (!stockValidation.valid) {
        this.snackBar.open(stockValidation.message!, 'OK', { duration: 4000 });
        this.isPlacingOrder.set(false);
        return;
      }

      // Step 2: Create order directly with simplified payload
      const userId = localStorage.getItem('userId');
      
      const orderData = {
        userId: parseInt(userId!),
        items: this.cartItems().map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
          size: item.size || 'M'
        }))
      };

      this.orderService.createOrder(orderData).subscribe({
        next: async (response) => {
          // Step 3: Update stock quantities
          try {
            await this.updateProductStocks();
          } catch (error) {
            console.error('Error updating stock:', error);
            // Order is placed, but stock update failed - log this for admin
          }

          // Step 4: Clear cart
          this.cartService.clearCart();

          // Step 5: Show success and redirect
          this.isPlacingOrder.set(false);
          this.snackBar.open('Order placed successfully!', 'OK', { duration: 3000 });
          this.router.navigate(['/account'], { queryParams: { tab: 'orders' } });
        },
        error: (error) => {
          this.isPlacingOrder.set(false);
          console.error('Error placing order:', error);
          this.snackBar.open(
            error.error?.message || 'Failed to place order. Please try again.',
            'OK',
            { duration: 4000 }
          );
        }
      });
    } catch (error) {
      this.isPlacingOrder.set(false);
      console.error('Error in order process:', error);
      this.snackBar.open('An error occurred. Please try again.', 'OK', { duration: 3000 });
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
