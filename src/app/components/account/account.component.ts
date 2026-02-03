import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './account.html',
  styleUrl: './account.scss'
})
export class AccountComponent implements OnInit {
  user = signal<any>(null);
  isLoading = signal(true);
  activeTab = signal<'profile' | 'orders' | 'addresses'>('profile');

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadUserProfile();
  }

  loadUserProfile() {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      this.router.navigate(['/login']);
      return;
    }

    this.userService.getUserById(userId).subscribe({
      next: (user: any) => {
        this.user.set(user);
        this.isLoading.set(false);
      },
      error: (error: any) => {
        console.error('Failed to load user profile:', error);
        this.isLoading.set(false);
      }
    });
  }

  setActiveTab(tab: 'profile' | 'orders' | 'addresses') {
    this.activeTab.set(tab);
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        this.router.navigate(['/']);
      },
      error: (error) => {
        // Even if logout fails, clear local storage and navigate
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        this.router.navigate(['/']);
      }
    });
  }
}
