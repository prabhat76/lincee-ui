import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService, Product } from '../../../services/product.service';
import { Observable } from 'rxjs';
import { listAnimation, fadeInAnimation, slideInUpAnimation } from '../../../core/animations';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  animations: [listAnimation, fadeInAnimation, slideInUpAnimation]
})
export class HomeComponent implements OnInit {
  private productService = inject(ProductService);
  newArrivals$: Observable<Product[]> | undefined;

  ngOnInit() {
    this.newArrivals$ = this.productService.getNewArrivals();
  }
}
