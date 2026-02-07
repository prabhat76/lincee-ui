import { Component, HostListener, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService } from '../../../services/cart.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  private cartService = inject(CartService);
  
  isScrolled = signal(false);
  isMenuOpen = signal(false);
  cartCount = this.cartService.cartCount;

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled.set(window.scrollY > 10);
  }

  toggleMenu() {
    this.isMenuOpen.set(!this.isMenuOpen());
  }
}