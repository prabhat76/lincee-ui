import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { fadeInAnimation, listAnimation, slideInUpAnimation } from '../../core/animations';
import { BannerService, Banner } from '../../services/banner.service';

@Component({
  selector: 'app-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './banner.component.html',
  styleUrl: './banner.component.scss',
  animations: [fadeInAnimation, slideInUpAnimation, listAnimation]
})
export class BannerComponent implements OnInit {
  private bannerService = inject(BannerService);
  
  banner = signal<Banner | null>(null);
  loading = signal(true);
  badges = ['Free shipping over $75', 'Limited edition drops', 'Ethically made'];

  ngOnInit() {
    this.loadBanner();
  }

  private loadBanner() {
    this.bannerService.getBannersByPosition('hero').subscribe({
      next: (banners) => {
        if (banners.length > 0) {
          this.banner.set(banners[0]); // Get first active hero banner
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Failed to load hero banner:', error);
        this.loading.set(false);
      }
    });
  }

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
