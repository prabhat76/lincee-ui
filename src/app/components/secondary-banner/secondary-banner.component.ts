import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-secondary-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './secondary-banner.component.html',
  styleUrls: ['./secondary-banner.component.scss']
})
export class SecondaryBannerComponent {
  scrollToProducts() {
    const productsElement = document.getElementById('products');
    if (productsElement) {
      productsElement.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
