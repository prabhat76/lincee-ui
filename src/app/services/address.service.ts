import { Injectable, inject, signal } from '@angular/core';
import { ApiService } from '../core/api.service';
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

export interface Address {
  id?: number;
  userId?: number;
  street: string;
  city: string;
  state?: string;
  zipCode: string;
  country?: string;
  phoneNumber?: string;
  type?: 'SHIPPING' | 'BILLING';
  isDefault?: boolean;
  createdAt?: string;
}

export interface SavedAddress extends Address {
  id: number;
}

@Injectable({
  providedIn: 'root'
})
export class AddressService {
  private apiService = inject(ApiService);

  // State management
  savedAddresses = signal<SavedAddress[]>([]);
  lastUsedAddress = signal<SavedAddress | null>(this.getLastUsedAddressFromStorage());

  // Load user's saved addresses
  getUserAddresses(userId: number): Observable<SavedAddress[]> {
    return this.apiService.get<SavedAddress[]>(`addresses/user/${userId}`).pipe(
      tap(addresses => {
        this.savedAddresses.set(addresses || []);
        // If no last used address, set the first or default one
        if (!this.lastUsedAddress() && addresses && addresses.length > 0) {
          const defaultAddress = addresses.find(a => a.isDefault) || addresses[0];
          this.setLastUsedAddress(defaultAddress);
        }
      }),
      catchError(() => {
        console.error('Failed to load addresses');
        return of([]);
      })
    );
  }

  // Get a specific address
  getAddress(addressId: number): Observable<SavedAddress> {
    return this.apiService.get<SavedAddress>(`addresses/${addressId}`);
  }

  // Save a new address
  addAddress(address: Address): Observable<SavedAddress> {
    return this.apiService.post<SavedAddress>('addresses', address).pipe(
      tap(newAddress => {
        const current = this.savedAddresses();
        this.savedAddresses.set([...current, newAddress]);
        this.setLastUsedAddress(newAddress);
      }),
      catchError(err => {
        console.error('Failed to add address:', err);
        throw err;
      })
    );
  }

  // Update an address
  updateAddress(addressId: number, address: Address): Observable<SavedAddress> {
    return this.apiService.put<SavedAddress>(`addresses/${addressId}`, address).pipe(
      tap(updatedAddress => {
        const current = this.savedAddresses();
        const index = current.findIndex(a => a.id === addressId);
        if (index >= 0) {
          current[index] = updatedAddress;
          this.savedAddresses.set([...current]);
        }
        this.setLastUsedAddress(updatedAddress);
      }),
      catchError(err => {
        console.error('Failed to update address:', err);
        throw err;
      })
    );
  }

  // Delete an address
  deleteAddress(addressId: number): Observable<any> {
    return this.apiService.delete(`addresses/${addressId}`).pipe(
      tap(() => {
        const current = this.savedAddresses();
        this.savedAddresses.set(current.filter(a => a.id !== addressId));
        // If deleted address was last used, clear it
        if (this.lastUsedAddress()?.id === addressId) {
          this.clearLastUsedAddress();
        }
      }),
      catchError(err => {
        console.error('Failed to delete address:', err);
        throw err;
      })
    );
  }

  // Set the last used address and save to storage
  setLastUsedAddress(address: SavedAddress | null): void {
    this.lastUsedAddress.set(address);
    if (address) {
      localStorage.setItem('lastUsedAddress', JSON.stringify(address));
    } else {
      localStorage.removeItem('lastUsedAddress');
    }
  }

  // Get last used address from storage
  private getLastUsedAddressFromStorage(): SavedAddress | null {
    try {
      const stored = localStorage.getItem('lastUsedAddress');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  // Clear last used address
  clearLastUsedAddress(): void {
    this.lastUsedAddress.set(null);
    localStorage.removeItem('lastUsedAddress');
  }

  // Get formatted address string
  formatAddress(address: Address): string {
    const parts = [address.street, address.city];
    if (address.state) parts.push(address.state);
    parts.push(address.zipCode);
    if (address.country) parts.push(address.country);
    return parts.filter(p => p).join(', ');
  }
}
