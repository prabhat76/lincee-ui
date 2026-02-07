import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BannerComponent } from '../../banner/banner.component';
import { SecondaryBannerComponent } from '../../secondary-banner/secondary-banner.component';
import { ProductsComponent } from '../../products/products.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, BannerComponent, SecondaryBannerComponent, ProductsComponent],
  template: `<app-banner></app-banner>
<app-secondary-banner></app-secondary-banner>
<app-products></app-products>`,
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {}
