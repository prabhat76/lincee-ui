import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = signal(false);
  errorMessage = signal('');
  isRegister = signal(false);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: [''],
      firstName: [''],
      lastName: [''],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      phone: [''],
      confirmPassword: ['']
    });
  }

  toggleMode() {
    this.isRegister.update(v => !v);
    this.errorMessage.set('');
    
    // Update form validators based on mode
    const usernameControl = this.loginForm.get('username');
    const firstNameControl = this.loginForm.get('firstName');
    const lastNameControl = this.loginForm.get('lastName');
    const phoneControl = this.loginForm.get('phone');
    const confirmPasswordControl = this.loginForm.get('confirmPassword');
    
    if (this.isRegister()) {
      // In register mode - require all fields
      usernameControl?.setValidators([Validators.required, Validators.minLength(3)]);
      firstNameControl?.setValidators([Validators.required, Validators.minLength(2)]);
      lastNameControl?.setValidators([Validators.required, Validators.minLength(2)]);
      phoneControl?.setValidators([Validators.required, Validators.pattern(/^[0-9]{10}$/)]);
      confirmPasswordControl?.setValidators([Validators.required, Validators.minLength(6)]);
    } else {
      // In login mode - only email and password are required
      usernameControl?.clearValidators();
      firstNameControl?.clearValidators();
      lastNameControl?.clearValidators();
      phoneControl?.clearValidators();
      confirmPasswordControl?.clearValidators();
    }
    
    usernameControl?.updateValueAndValidity();
    firstNameControl?.updateValueAndValidity();
    lastNameControl?.updateValueAndValidity();
    phoneControl?.updateValueAndValidity();
    confirmPasswordControl?.updateValueAndValidity();
    this.loginForm.reset();
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.errorMessage.set('Please fill in all required fields');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    if (this.isRegister()) {
      if (this.loginForm.get('password')?.value !== this.loginForm.get('confirmPassword')?.value) {
        this.errorMessage.set('Passwords do not match');
        this.isLoading.set(false);
        return;
      }

      const registerData = {
        username: this.loginForm.get('username')?.value,
        firstName: this.loginForm.get('firstName')?.value,
        lastName: this.loginForm.get('lastName')?.value,
        email: this.loginForm.get('email')?.value,
        password: this.loginForm.get('password')?.value,
        phone: this.loginForm.get('phone')?.value
      };

      this.authService.register(registerData).subscribe({
        next: (response: any) => {
          this.isLoading.set(false);
          if (response.token) {
            localStorage.setItem('token', response.token);
            localStorage.setItem('userId', response.userId || response.id || '');
            this.router.navigate(['/']);
          } else {
            this.errorMessage.set('Registration successful! Please log in.');
            this.toggleMode();
          }
        },
        error: (error: any) => {
          this.isLoading.set(false);
          this.errorMessage.set(error.error?.message || error.message || 'Registration failed');
        }
      });
    } else {
      const loginData = {
        email: this.loginForm.get('email')?.value,
        password: this.loginForm.get('password')?.value
      };

      this.authService.login(loginData).subscribe({
        next: (response: any) => {
          this.isLoading.set(false);
          if (response.token) {
            localStorage.setItem('token', response.token);
            localStorage.setItem('userId', response.userId || response.id || '');
            this.router.navigate(['/']);
          }
        },
        error: (error: any) => {
          this.isLoading.set(false);
          this.errorMessage.set(error.error?.message || error.message || 'Login failed');
        }
      });
    }
  }
}
