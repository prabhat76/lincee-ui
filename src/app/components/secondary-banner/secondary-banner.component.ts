import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { fadeInAnimation, slideInUpAnimation } from '../../core/animations';
import { BannerService, Banner } from '../../services/banner.service';

@Component({
  selector: 'app-secondary-banner',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './secondary-banner.component.html',
  styleUrls: ['./secondary-banner.component.scss'],
  animations: [fadeInAnimation, slideInUpAnimation]
})
export class SecondaryBannerComponent implements OnInit {
  private bannerService = inject(BannerService);
  
  banner = signal<Banner | null>(null);
  loading = signal(true);

  ngOnInit() {
    this.loadBanner();
  }

  private loadBanner() {
    this.bannerService.getBannersByPosition('secondary').subscribe({
      next: (banners) => {
        if (banners.length > 0) {
          this.banner.set(banners[0]); // Get first active secondary banner
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Failed to load secondary banner:', error);
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
}
