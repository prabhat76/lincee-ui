import { Routes } from '@angular/router';
import { HomeComponent } from './components/pages/home/home.component';
import { LayoutComponent } from './components/layout/layout.component';
import { CartComponent } from './components/pages/cart/cart.component';
import { LoginComponent } from './components/pages/login/login.component';
import { RegisterComponent } from './components/pages/register/register.component';
import { CheckoutComponent } from './components/pages/checkout/checkout.component';
import { ProductDetailsComponent } from './components/products/product-details/product-details';
import { AccountComponent } from './components/pages/account/account';
import { AdminComponent } from './components/pages/admin/admin.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', component: HomeComponent },
      { path: 'products/:id', component: ProductDetailsComponent },
      { path: 'cart', component: CartComponent },
      { path: 'checkout', component: CheckoutComponent },
      { path: 'account', component: AccountComponent }, // New route
      { path: 'admin', component: AdminComponent },
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent },
    ]
  },
  { path: '**', redirectTo: '', pathMatch: 'full' } // Wildcard route
];
