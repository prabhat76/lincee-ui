import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { fadeInAnimation, listAnimation, slideInUpAnimation } from '../../core/animations';

@Component({
  selector: 'app-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './banner.component.html',
  styleUrl: './banner.component.scss',
  animations: [fadeInAnimation, slideInUpAnimation, listAnimation]
})
export class BannerComponent {
  badges = ['Free shipping over $75', 'Limited edition drops', 'Ethically made'];

  scrollToProducts() {
    const productsElement = document.getElementById('products');
    if (productsElement) {
      productsElement.scrollIntoView({ behavior: 'smooth' });
    }
  }

  scrollToSecondaryBanner() {
    const secondaryBanner = document.getElementById('secondary-banner');
    if (secondaryBanner) {
      secondaryBanner.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
