import { Component, OnInit, signal } from '@angular/core';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, MatToolbarModule, MatButtonModule, MatIconModule, MatBadgeModule, MatMenuModule, MatDividerModule],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class HeaderComponent implements OnInit {
  isMenuOpen = signal(false);
  cartItemCount = signal(0);
  isLoggedIn = signal(false);

  constructor(
    private cartService: CartService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // Check if user is logged in
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    this.isLoggedIn.set(!!token);

    // Subscribe to cart changes
    this.cartService.cart$.subscribe(() => {
      this.cartItemCount.set(this.cartService.getCartItemCount());
    });
  }

  toggleMenu() {
    this.isMenuOpen.update(v => !v);
  }

  goToCart() {
    this.router.navigate(['/cart']);
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        this.isLoggedIn.set(false);
        this.router.navigate(['/']);
      },
      error: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        this.isLoggedIn.set(false);
        this.router.navigate(['/']);
      }
    });
  }

  navigateTo(path: string) {
    this.router.navigate([path]);
    this.isMenuOpen.set(false);
  }
}
