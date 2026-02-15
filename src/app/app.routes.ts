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
import { OrderDetailComponent } from './components/pages/order-detail/order-detail';
import { ForgotPasswordComponent } from './components/pages/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './components/pages/reset-password/reset-password.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', component: HomeComponent },
      { path: 'products/:id', component: ProductDetailsComponent },
      { path: 'cart', component: CartComponent },
      { path: 'checkout', component: CheckoutComponent },
      { path: 'account', component: AccountComponent },
      { path: 'orders/:id', component: OrderDetailComponent },
      { path: 'admin', component: AdminComponent },
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent },
      { path: 'forgot-password', component: ForgotPasswordComponent },
      { path: 'reset-password', component: ResetPasswordComponent },
    ]
  },
  { path: '**', redirectTo: '', pathMatch: 'full' } // Wildcard route
];
