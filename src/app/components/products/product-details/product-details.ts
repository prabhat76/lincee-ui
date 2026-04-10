import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProductService, Product } from '../../../services/product.service';
import { CartService } from '../../../services/cart.service';
import { AuthService } from '../../../services/auth.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './product-details.html',
  styleUrl: './product-details.scss'
})
export class ProductDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  product = signal<Product | null>(null);
  loading = signal<boolean>(true);
  selectedColor = signal<string>('');
  selectedSize = signal<string>('M');
  
  colors: string[] = [];
  sizes: string[] = ['M'];

  addingToCart = signal<boolean>(false);
  message = signal<string>('');
  private addCooldownUntil = 0;

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.loadProduct(id);
      }
    });
  }

  loadProduct(id: number) {
    this.loading.set(true);
    this.productService.getProduct(id).subscribe({
      next: (data) => {
        this.product.set(data);
        this.sizes = data.availableSizes?.length ? data.availableSizes : ['M'];
        this.colors = data.availableColors?.length ? data.availableColors : [];
        this.selectedSize.set(this.sizes[0] || 'M');
        this.selectedColor.set(this.colors[0] || '');
        this.loading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.loading.set(false);
      }
    });
  }

  selectColor(color: string) {
    this.selectedColor.set(color);
  }

  selectSize(size: string) {
    this.selectedSize.set(size);
  }

  addToCart() {
    if (!this.ensureAuthenticated()) return;
    if (this.addingToCart()) return;
    if (Date.now() < this.addCooldownUntil) {
      this.notificationService.warning('Please wait a moment before retrying.');
      return;
    }
    const p = this.product();
    if (!p) return;

    this.addingToCart.set(true);
    // Passing size/color if I can update CartService
    this.cartService.addToCart(p.id, 1, this.selectedSize(), this.selectedColor() || undefined).subscribe({
      next: () => {
        this.addingToCart.set(false);
        this.message.set('Added to cart!');
        setTimeout(() => this.message.set(''), 3000);
      },
      error: () => {
        this.addingToCart.set(false);
        this.addCooldownUntil = Date.now() + 1500;
        this.message.set('Failed to add to cart.');
      }
    });
  }

  buyNow() {
    if (!this.ensureAuthenticated()) return;
    if (this.addingToCart()) return;
    if (Date.now() < this.addCooldownUntil) {
      this.notificationService.warning('Please wait a moment before retrying.');
      return;
    }
    const p = this.product();
    if (!p) return;

    this.addingToCart.set(true);
    this.cartService.addToCart(p.id, 1, this.selectedSize(), this.selectedColor() || undefined).subscribe({
      next: () => {
        this.addingToCart.set(false);
        this.router.navigate(['/checkout']);
      },
      error: () => {
        this.addingToCart.set(false);
        this.addCooldownUntil = Date.now() + 1500;
        this.message.set('Failed to add to cart.');
      }
    });
  }

  increaseQuantity() {
    if (!this.ensureAuthenticated()) return;
    if (this.addingToCart()) return;
    const p = this.product();
    if (!p) return;
    this.addingToCart.set(true);
    this.cartService.addToCart(p.id, 1, this.selectedSize(), this.selectedColor() || undefined).subscribe({
      next: () => this.addingToCart.set(false),
      error: () => this.addingToCart.set(false)
    });
  }

  decreaseQuantity() {
    if (!this.ensureAuthenticated()) return;
    if (this.addingToCart()) return;
    const p = this.product();
    if (!p) return;
    this.addingToCart.set(true);
    this.cartService.updateQuantity(p.id, -1);
    setTimeout(() => this.addingToCart.set(false), 400);
  }

  getQuantity(): number {
    const p = this.product();
    if (!p) return 0;
    const cart = this.cartService.cart();
    return cart.items
      .filter(item => item.productId === p.id)
      .reduce((acc, item) => acc + item.quantity, 0);
  }

  handleImageError(event: any) {
    event.target.src = 'assets/image.png';
  }

  getPrimaryImage(product: Product): string {
    return this.getViewImage(product, ['front', 'back'])
      || product.images?.[0]
      || 'assets/image.png';
  }

  getHoverImage(product: Product): string | null {
    return this.getViewImage(product, ['lifestyle'])
      || (product.images && product.images.length > 1 ? product.images[1] : null);
  }

  private getViewImage(product: Product, views: string[]): string | null {
    if (!product.productImages || product.productImages.length === 0) {
      return null;
    }

    const viewSet = views.map(view => view.toLowerCase());
    const match = product.productImages.find(image =>
      image.view && viewSet.includes(image.view.toLowerCase())
    );

    return match?.url || null;
  }

  private ensureAuthenticated(): boolean {
    if (this.authService.isAuthenticated()) {
      return true;
    }

    this.message.set('Please log in to continue.');
    this.router.navigate(['/login'], { queryParams: { redirect: this.router.url } });
    return false;
  }
}
