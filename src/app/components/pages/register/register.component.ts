import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  registerForm = this.fb.group({
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  errorMsg = '';
  loading = false;

  onSubmit() {
    if (this.registerForm.valid) {
      this.loading = true;
      this.errorMsg = '';
      
      // Common Fix: Backend often requires 'username', so we map email to it.
      const payload = {
        ...this.registerForm.value,
        username: this.registerForm.value.email,
        role: 'USER'
      };

      this.authService.register(payload).subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate(['/login'], { queryParams: { registered: 'true' } });
        },
        error: (err) => {
          this.loading = false;
          // Display a friendly error, but log the full details
          this.errorMsg = err?.error?.message || 'Registration failed. Try a different email address.';
          console.error('Registration Error:', err);
        }
      });
    }
  }
}
