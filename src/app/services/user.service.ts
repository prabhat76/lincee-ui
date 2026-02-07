import { Injectable, inject, signal } from '@angular/core';
import { ApiService } from '../core/api.service';
import { Observable, tap } from 'rxjs';

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiService = inject(ApiService);
  currentUser = signal<User | null>(null);

  getProfile(): Observable<User> {
    return this.apiService.get<User>('user/profile').pipe(
      tap(user => this.currentUser.set(user))
    );
  }

  // Add login/register if needed, keeping it lightweight for now
}
