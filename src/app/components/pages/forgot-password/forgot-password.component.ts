import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  loading = signal(false);
  successMsg = signal('');
  errorMsg = signal('');

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  submit() {
    if (this.form.invalid) return;

    this.loading.set(true);
    this.errorMsg.set('');
    this.successMsg.set('');

    const email = this.form.value.email || '';
    this.authService.requestPasswordReset(email).subscribe({
      next: () => {
        this.loading.set(false);
        this.successMsg.set('If the email exists, a reset link has been sent.');
      },
      error: (err) => {
        console.error(err);
        this.loading.set(false);
        this.errorMsg.set('Failed to send reset email. Please try again.');
      }
    });
  }
}
