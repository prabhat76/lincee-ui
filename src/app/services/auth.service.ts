import { Injectable, inject, signal } from '@angular/core';
import { ApiService } from '../core/api.service';
import { HttpClient } from '@angular/common/http'; // Used for raw requests if ApiService is too generic, but ApiService is fine.
import { Router } from '@angular/router';
import { tap } from 'rxjs';

interface LoginResponse {
  token: string;
  user: any; // Or a specific user interface
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiService = inject(ApiService);
  private router = inject(Router);
  
  // Signals for state
  currentUser = signal<any>(null);
  isAuthenticated = signal<boolean>(false);

  constructor() {
    this.checkToken();
  }

  private checkToken() {
    const token = localStorage.getItem('token');
    if (token) {
      this.isAuthenticated.set(true);
      // Optionally fetch user profile logic here
      const user = localStorage.getItem('user');
      if (user) {
        this.currentUser.set(JSON.parse(user));
      }
    }
  }

  register(userData: any) {
    return this.apiService.post<any>('auth/register', userData).pipe(
      tap(response => {
        // Usually register automatically logs in or requires login. 
        // Assuming it might return a token or just success.
        // For now, let's assume it requires redirection to login.
      })
    );
  }

  login(credentials: {email: string, password: string}) {
    return this.apiService.post<LoginResponse>('auth/authenticate', credentials).pipe(
      tap(response => {
        if (response.token) {
          localStorage.setItem('token', response.token);
          this.isAuthenticated.set(true);
          // If user info comes back
          if (response.user) {
             this.currentUser.set(response.user);
             localStorage.setItem('user', JSON.stringify(response.user));
          }
          this.router.navigate(['/']);
        }
      })
    );
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.isAuthenticated.set(false);
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }
}
