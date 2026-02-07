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
      this.authService.register(this.registerForm.value as any).subscribe({
        next: () => {
          this.loading = false;
          // Redirect to login after successful registration or auto-login
          // For now, let's redirect to login with a message (or just login logic)
          this.router.navigate(['/login']);
        },
        error: (err) => {
          this.loading = false;
          this.errorMsg = 'Registration failed. Please try again.';
          console.error(err);
        }
      });
    }
  }
}
