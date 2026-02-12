import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService } from '../../../services/cart.service';
import { OrderService } from '../../../services/order.service';
import { AuthService } from '../../../services/auth.service';
import { PaymentService, PaymentGateway } from '../../../services/payment.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="checkout-page">
      <div class="container">
        <h1>Checkout</h1>
        
        <div class="checkout-grid">
          <div class="form-section">
            <form [formGroup]="checkoutForm" (ngSubmit)="placeOrder()">
              <h2>Shipping Address</h2>
              <div class="input-group">
                <input formControlName="address" placeholder="Street Address" type="text" />
              </div>
              <div class="input-group">
                <input formControlName="city" placeholder="City" type="text" />
              </div>
              <div class="input-group">
                <input formControlName="zip" placeholder="ZIP Code" type="text" />
              </div>

               <h2>Payment Method</h2>
               <div class="payment-gateways">
                 <div class="payment-gateway-grid">
                   <button *ngFor="let method of paymentMethods()"
                           type="button"
                           class="payment-btn"
                           [class.active]="selectedPaymentGateway() === method.gateway"
                           (click)="selectGateway(method.gateway)">
                     <svg *ngIf="method.gateway === 'stripe'" viewBox="0 0 24 24" fill="currentColor">
                       <path d="M13.86 3.66L2.1 10.48v6.7L13.86 20.08v-3.38l6.04-3.06v-4.2l-6.04-3.06v-2.76m8.14-1.32V8.6l-6.04 3.06v3.76l6.04 3.06v3.56L24 16.18v-8.6L22 5.34z"/>
                     </svg>
                     <svg *ngIf="method.gateway === 'phonepay'" viewBox="0 0 24 24" fill="currentColor">
                       <rect x="2" y="2" width="20" height="20" rx="2" ry="2"/>
                       <text x="12" y="16" text-anchor="middle" font-weight="bold" fill="white" font-size="8">Pay</text>
                     </svg>
                     <svg *ngIf="method.gateway === 'gpay'" viewBox="0 0 24 24" fill="currentColor">
                       <circle cx="12" cy="12" r="10"/>
                       <text x="12" y="15" text-anchor="middle" font-weight="bold" fill="white" font-size="6">G</text>
                     </svg>
                     <svg *ngIf="method.gateway === 'paypal'" viewBox="0 0 24 24" fill="currentColor">
                       <path d="M9.5 3h5l-1 7H8l1-7m-8 0h5l-1 7H0l1-7m8.5 10h5l-1 4H8l1-4"/>
                     </svg>
                     <span>{{ method.name }}</span>
                   </button>
                 </div>
               </div>

               <p class="error" *ngIf="errorMsg">{{ errorMsg }}</p>
               <button type="submit" [disabled]="loading || checkoutForm.invalid" class="btn-primary">
                 {{ loading ? 'Processing...' : 'PLACE ORDER' }}
               </button>
            </form>
          </div>

          <div class="summary-section">
            <h2>Order Summary</h2>
            <div *ngFor="let item of cart().items" class="summary-item">
              <span>{{ item.productName }} x {{ item.quantity }}</span>
              <span>{{ (item.price || 0) * item.quantity | currency }}</span>
            </div>
            <div class="total-row">
              <strong>TOTAL</strong>
              <strong>{{ cart().total | currency }}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .checkout-page { 
      padding: 40px 0; 
      background: var(--color-background); 
      color: var(--color-text); 
      min-height: 80vh; 
    }
    .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
    h1 { 
      margin-bottom: 40px; 
      border-bottom: 1px solid var(--color-border); 
      padding-bottom: 20px; 
    }
    h2 { 
      font-size: 1.2rem; margin-bottom: 20px; 
      color: var(--color-secondary); 
      text-transform: uppercase; letter-spacing: 1px; 
    }
    
    .checkout-grid { display: grid; grid-template-columns: 1fr 400px; gap: 60px; }
    @media(max-width: 768px) { .checkout-grid { grid-template-columns: 1fr; } }
    
    .input-group { margin-bottom: 20px; }
    input { 
      width: 100%; padding: 15px; 
      background: var(--color-surface); 
      border: 1px solid var(--color-border); 
      color: var(--color-text); 
      font-family: inherit;
    }
    input:focus { border-color: var(--color-primary); outline: none; }
    
    .summary-section { 
      background: var(--color-surface); 
      padding: 30px; 
      border-radius: 4px; 
      height: fit-content; 
    }
    .summary-item { 
      display: flex; justify-content: space-between; margin-bottom: 15px; 
      color: var(--color-secondary); 
    }
    .total-row { 
      display: flex; justify-content: space-between; margin-top: 20px; padding-top: 20px; 
      border-top: 1px solid var(--color-border); 
      font-size: 1.2rem; 
    }
    
    .btn-primary { 
      width: 100%; padding: 16px; 
      background: var(--color-primary); 
      color: var(--color-background); 
      font-weight: bold; border: 1px solid var(--color-primary); 
      cursor: pointer; margin-top: 20px; 
      transition: all 0.3s;
    }
    .btn-primary:hover {
        background: transparent;
        color: var(--color-primary);
    }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
    .error { color: #ff4444; margin-top: 10px; }
    
    .payment-gateways { margin: 20px 0; }
    .payment-gateway-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
      gap: 12px;
    }

    .payment-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 16px;
      background: var(--color-surface);
      border: 2px solid var(--color-border);
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s;
      color: var(--color-text);
      font-size: 0.9rem;
      font-weight: 500;
    }

    .payment-btn svg {
      width: 32px;
      height: 32px;
    }

    .payment-btn:hover {
      border-color: var(--color-primary);
      background: rgba(0, 0, 0, 0.05);
    }

    .payment-btn.active {
      border-color: var(--color-primary);
      background: var(--color-primary);
      color: white;
    }
  `]
})
export class CheckoutComponent {
  private fb = inject(FormBuilder);
  private cartService = inject(CartService);
  private orderService = inject(OrderService);
  private authService = inject(AuthService);
  private paymentService = inject(PaymentService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  cart = this.cartService.cart;
  loading = false;
  errorMsg = '';

  selectedPaymentGateway = signal<PaymentGateway>('stripe');
  paymentMethods = () => this.paymentService.getAvailableGateways();

  checkoutForm = this.fb.group({
    address: ['', Validators.required],
    city: ['', Validators.required],
    zip: ['', Validators.required],
    paymentMethod: ['stripe', Validators.required]
  });

  selectGateway(gateway: PaymentGateway) {
    this.selectedPaymentGateway.set(gateway);
    this.paymentService.setGateway(gateway);
    this.notificationService.info(`Payment method changed to ${gateway.toUpperCase()}`);
  }

  placeOrder() {
    if (this.checkoutForm.invalid) return;
    
    // Check authentication signal
    if (!this.authService.isAuthenticated()) {
      this.notificationService.warning('Please login to continue');
      this.router.navigate(['/login']);
      return;
    }

    this.loading = true;
    const formVal = this.checkoutForm.value;
    const fullAddress = `${formVal.address}, ${formVal.city}, ${formVal.zip}`;
    
    // Use the robust getter from AuthService
    const userId = this.authService.currentUserId;
    
    if (!userId) {
       this.errorMsg = "Authentication Error: User ID missing. Please login again.";
       this.notificationService.error(this.errorMsg);
       this.loading = false;
       return;
    }

    const orderPayload = {
      userId,
      shippingAddressId: null,
      billingAddressId: null,
      paymentMethodId: null,
      shippingMethod: 'STANDARD',
      notes: `Ship to: ${fullAddress} | Payment: ${this.selectedPaymentGateway()}`,
      items: this.cart().items.map(i => ({
        productId: i.productId,
        quantity: i.quantity,
        size: i.size || 'M',
        color: i.color || 'Black'
      }))
    };

    console.log('Sending Order Payload:', orderPayload);

    this.orderService.createOrder(orderPayload).subscribe({
      next: (res) => {
        const orderId = res.id || res.orderNumber;
        this.notificationService.success(`Order created successfully! ID: ${orderId}`);
        
        // Process payment
        this.processPayment(orderId, this.cart().total);
      },
      error: (err) => {
        console.error(err);
        this.errorMsg = 'Failed to place order. ' + (err.error?.message || err.message);
        this.notificationService.error(this.errorMsg);
        this.loading = false;
      }
    });
  }

  private processPayment(orderId: number, amount: number) {
    const gateway = this.selectedPaymentGateway();
    
    this.paymentService.initiatePayment({
      orderId,
      amount,
      currency: 'USD',
      gateway,
      metadata: { items: this.cart().items }
    }).subscribe({
      next: (response) => {
        this.notificationService.success(`Payment processing with ${gateway.toUpperCase()}...`);
        
        if (response.redirectUrl) {
          // Redirect to payment gateway
          window.location.href = response.redirectUrl;
        } else {
          // Payment successful
          this.notificationService.success('Payment completed successfully!');
          this.cartService.clearLocalCart();
          setTimeout(() => {
            this.router.navigate(['/account']);
          }, 1500);
        }
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.errorMsg = `Payment failed with ${gateway.toUpperCase()}. Please try again.`;
        this.notificationService.error(this.errorMsg);
        this.loading = false;
      }
    });
  }
}
