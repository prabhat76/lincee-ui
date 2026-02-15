import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  loading = signal(false);
  successMsg = signal('');
  errorMsg = signal('');

  form = this.fb.group({
    token: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]]
  });

  constructor() {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (token) {
      this.form.patchValue({ token });
    }
  }

  submit() {
    if (this.form.invalid) return;

    const { password, confirmPassword, token } = this.form.value;
    if (password !== confirmPassword) {
      this.errorMsg.set('Passwords do not match.');
      return;
    }

    this.loading.set(true);
    this.errorMsg.set('');
    this.successMsg.set('');

    this.authService.resetPassword(token || '', password || '').subscribe({
      next: () => {
        this.loading.set(false);
        this.successMsg.set('Password updated. You can now sign in.');
        setTimeout(() => this.router.navigate(['/login']), 1200);
      },
      error: (err) => {
        console.error(err);
        this.loading.set(false);
        this.errorMsg.set('Failed to reset password. Please try again.');
      }
    });
  }
}
