import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService, User as ProfileUser } from '../../../services/user.service';
import { User } from '../../../models/user.model';
import { Address } from '../../../models/address.model';
import { listAnimation } from '../../../core/animations';
import { AuthService } from '../../../services/auth.service';
import { AddressService, Address as ServiceAddress, SavedAddress } from '../../../services/address.service';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss'],
  animations: [listAnimation]
})
export class AccountComponent implements OnInit {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private addressService = inject(AddressService);

  user: User | null = null;
  addressForm: FormGroup;
  isEditing = false;

  constructor() {
    this.addressForm = this.fb.group({
      id: [null],
      addressLine1: ['', Validators.required],
      addressLine2: [''],
      city: ['', Validators.required],
      state: ['', Validators.required],
      zipCode: ['', Validators.required],
      country: ['India', Validators.required],
      phoneNumber: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadUserData();
  }

  loadUserData(): void {
    this.userService.getProfile().subscribe(profile => {
      const userWithAddresses: User = {
        ...(profile as ProfileUser),
        addresses: []
      };
      this.user = userWithAddresses;
      this.loadAddresses();
    });
  }

  private loadAddresses(): void {
    const userId = this.authService.currentUserId || this.user?.id;
    if (!userId) {
      return;
    }

    this.addressService.getUserAddresses(userId).subscribe(addresses => {
      if (!this.user) return;
      this.user = {
        ...this.user,
        addresses: addresses.map(address => this.mapServiceAddress(address))
      };
    });
  }

  editAddress(address: Address): void {
    this.isEditing = true;
    this.addressForm.patchValue(address);
  }

  saveAddress(): void {
    if (this.addressForm.valid) {
      const addressData = this.addressForm.value as Address;
      const userId = this.authService.currentUserId || this.user?.id;
      if (!userId) return;

      const payload = this.toServiceAddress(addressData, userId);
      if (this.isEditing) {
        if (!addressData.id) return;
        this.addressService.updateAddress(addressData.id, payload).subscribe(() => {
          this.loadAddresses();
          this.resetForm();
        });
      } else {
        this.addressService.addAddress(payload).subscribe(() => {
          this.loadAddresses();
          this.resetForm();
        });
      }
    }
  }

  deleteAddress(id: number): void {
    this.addressService.deleteAddress(id).subscribe(() => {
      this.loadAddresses();
    });
  }

  resetForm(): void {
    this.isEditing = false;
    this.addressForm.reset({ country: 'India' });
  }

  private mapServiceAddress(address: SavedAddress): Address {
    return {
      id: address.id,
      addressLine1: address.street || '',
      addressLine2: '',
      city: address.city || '',
      state: address.state || '',
      zipCode: address.zipCode || '',
      country: address.country || 'India',
      phoneNumber: address.phoneNumber || ''
    };
  }

  private toServiceAddress(address: Address, userId: number): ServiceAddress {
    return {
      userId,
      type: 'SHIPPING',
      street: address.addressLine1 || '',
      city: address.city || '',
      state: address.state || '',
      zipCode: address.zipCode || '',
      country: address.country || 'India',
      phoneNumber: address.phoneNumber || '',
      isDefault: true
    };
  }
}
