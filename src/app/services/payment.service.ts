import { Injectable, signal, inject } from '@angular/core';
import { ApiService } from '../core/api.service';
import { Observable, of } from 'rxjs';

export type PaymentGateway = 'stripe' | 'phonepay' | 'gpay' | 'paypal' | 'cod';

export interface PaymentMethod {
  gateway: PaymentGateway;
  name: string;
  icon: string;
  enabled: boolean;
}

export interface PaymentRequest {
  orderId: number;
  amount: number;
  currency: string;
  gateway: PaymentGateway;
  metadata?: Record<string, any>;
}

export interface PaymentResponse {
  success: boolean;
  transactionId: string;
  orderId: number;
  status: string;
  message: string;
  redirectUrl?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiService = inject(ApiService);
  
  activeGateway = signal<PaymentGateway>('stripe');
  
  paymentMethods: PaymentMethod[] = [
    { gateway: 'stripe', name: 'Stripe', icon: 'stripe', enabled: true },
    { gateway: 'phonepay', name: 'PhonePay', icon: 'phonepay', enabled: true },
    { gateway: 'gpay', name: 'Google Pay', icon: 'gpay', enabled: true },
    { gateway: 'paypal', name: 'PayPal', icon: 'paypal', enabled: true },
    { gateway: 'cod', name: 'Cash on Delivery', icon: 'cod', enabled: true }
  ];

  setGateway(gateway: PaymentGateway) {
    this.activeGateway.set(gateway);
  }

  getAvailableGateways(): PaymentMethod[] {
    return this.paymentMethods.filter(m => m.enabled);
  }

  initiatePayment(request: PaymentRequest): Observable<PaymentResponse> {
    const gateway = request.gateway;
    
    switch (gateway) {
      case 'stripe':
        return this.initiateStripePayment(request);
      case 'phonepay':
        return this.initiatePhonePayPayment(request);
      case 'gpay':
        return this.initiateGPayPayment(request);
      case 'paypal':
        return this.initiatePayPalPayment(request);
      case 'cod':
        return this.initiateCODPayment(request);
      default:
        throw new Error(`Unsupported payment gateway: ${gateway}`);
    }
  }

  private initiateStripePayment(request: PaymentRequest): Observable<PaymentResponse> {
    return this.apiService.post<PaymentResponse>('payments/stripe/initiate', {
      orderId: request.orderId,
      amount: request.amount,
      currency: request.currency,
      metadata: request.metadata
    });
  }

  private initiatePhonePayPayment(request: PaymentRequest): Observable<PaymentResponse> {
    return this.apiService.post<PaymentResponse>('payments/phonepay/initiate', {
      orderId: request.orderId,
      amount: request.amount,
      currency: request.currency,
      metadata: request.metadata
    });
  }

  private initiateGPayPayment(request: PaymentRequest): Observable<PaymentResponse> {
    return this.apiService.post<PaymentResponse>('payments/gpay/initiate', {
      orderId: request.orderId,
      amount: request.amount,
      currency: request.currency,
      metadata: request.metadata
    });
  }

  private initiatePayPalPayment(request: PaymentRequest): Observable<PaymentResponse> {
    return this.apiService.post<PaymentResponse>('payments/paypal/initiate', {
      orderId: request.orderId,
      amount: request.amount,
      currency: request.currency,
      metadata: request.metadata
    });
  }

  verifyPayment(orderId: number, gateway: PaymentGateway, transactionId: string): Observable<PaymentResponse> {
    return this.apiService.post<PaymentResponse>('payments/verify', {
      orderId,
      gateway,
      transactionId
    });
  }

  private initiateCODPayment(request: PaymentRequest): Observable<PaymentResponse> {
    // COD doesn't require payment gateway processing
    // Return immediate success response
    return of({
      success: true,
      transactionId: `COD-${request.orderId}-${Date.now()}`,
      orderId: request.orderId,
      status: 'PENDING',
      message: 'Cash on Delivery order placed successfully. Pay when you receive your order.'
    });
  }
}
