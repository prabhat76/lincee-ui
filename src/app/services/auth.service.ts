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

  // Helper to get the reliable ID regardless of structure
  get currentUserId(): number | null {
    const user = this.currentUser();
    return user?.id || user?.userId || null;
  }

  get currentUserRole(): string | null {
    return this.extractRole(this.currentUser());
  }

  private checkToken() {
    const token = localStorage.getItem('token');
    if (token) {
      this.isAuthenticated.set(true);
      // Optionally fetch user profile logic here
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          console.log('Restored user from storage:', user); // Debug log
          this.currentUser.set(user);
          if (['/login', '/register'].includes(this.router.url)) {
            this.navigateAfterLogin(user);
          }
        } catch (e) {
          console.error('Failed to parse user from storage', e);
          localStorage.removeItem('user'); // Clear bad data
        }
      }
    }
  }

  private extractRole(user: any): string | null {
    const role = user?.role || user?.roles?.[0] || user?.authorities?.[0]?.authority || null;
    return role ? String(role).toUpperCase() : null;
  }

  private navigateAfterLogin(user: any) {
    const role = this.extractRole(user);
    let target = '/account';

    if (role && role.includes('ADMIN')) {
      target = '/account';
    } else if (role && role.includes('USER')) {
      target = '/account';
    } else if (!role) {
      target = '/';
    }

    this.router.navigate([target]);
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
    // Backend expects username; we map email to username for compatibility.
    const payload = {
      username: credentials.email,
      password: credentials.password
    };

    console.log('Attempting login with username:', credentials.email);

    return this.apiService.post<LoginResponse>('auth/login', payload).pipe(
      tap(response => {
        if (response.token) {
          localStorage.setItem('token', response.token);
          this.isAuthenticated.set(true);
          
           // Handle both Nested { user: {...} } and Flat responses
           let userData = response.user || response;
           if (!response.user && (response as any).userId) {
             userData = {
              userId: (response as any).userId,
              username: (response as any).username,
              email: (response as any).email,
              role: (response as any).role
             };
           }

          if (userData && (userData.id || userData.userId)) {
             this.currentUser.set(userData);
             localStorage.setItem('user', JSON.stringify(userData));
             console.log('Login success, user stored:', userData);
             this.navigateAfterLogin(userData);
          } else {
             console.warn('Login success but NO user ID found in response:', response);
          }
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
