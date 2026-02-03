import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
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
  returnUrl: string = '/';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
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

    // Get return URL from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
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
          console.log('Register response:', response);
          this.isLoading.set(false);
          if (response.token) {
            // Store authentication data
            localStorage.setItem('authToken', response.token);
            localStorage.setItem('token', response.token); // Keep for backward compatibility
            localStorage.setItem('userId', response.userId?.toString() || '');
            localStorage.setItem('userRole', response.role || 'CUSTOMER');
            localStorage.setItem('isAdmin', response.isAdmin ? 'true' : 'false');
            localStorage.setItem('username', response.username || '');
            
            // Navigate to redirectTo or returnUrl
            if (response.redirectTo) {
              this.router.navigate([response.redirectTo]);
            } else {
              this.router.navigate([this.returnUrl]);
            }
          } else {
            this.errorMessage.set('Registration successful! Please log in.');
            this.toggleMode();
          }
        },
        error: (error: any) => {
          console.error('Register error:', error);
          this.isLoading.set(false);
          const errorMsg = error.error?.message || error.error?.error || error.message || 'Registration failed';
          this.errorMessage.set(errorMsg);
        }
      });
    } else {
      const loginData = {
        email: this.loginForm.get('email')?.value,
        password: this.loginForm.get('password')?.value
      };

      this.authService.login(loginData).subscribe({
        next: (response: any) => {
          console.log('Login response:', response);
          this.isLoading.set(false);
          if (response.token) {
            // Store authentication data
            localStorage.setItem('authToken', response.token);
            localStorage.setItem('token', response.token); // Keep for backward compatibility
            localStorage.setItem('userId', response.userId?.toString() || '');
            localStorage.setItem('userRole', response.role || 'CUSTOMER');
            localStorage.setItem('isAdmin', response.isAdmin ? 'true' : 'false');
            localStorage.setItem('username', response.username || '');
            
            // Navigate based on API's redirectTo or returnUrl
            if (this.returnUrl && this.returnUrl !== '/') {
              // User was trying to access a specific page
              this.router.navigate([this.returnUrl]);
            } else if (response.redirectTo) {
              // Use API's suggested redirect
              this.router.navigate([response.redirectTo]);
            } else if (response.isAdmin) {
              // Fallback: Admin goes to admin panel
              this.router.navigate(['/admin']);
            } else {
              // Fallback: Customer goes to home
              this.router.navigate(['/']);
            }
          }
        },
        error: (error: any) => {
          console.error('Login error:', error);
          this.isLoading.set(false);
          const errorMsg = error.error?.message || error.error?.error || error.message || 'Login failed. Please check your credentials.';
          this.errorMessage.set(errorMsg);
        }
      });
    }
  }
}
