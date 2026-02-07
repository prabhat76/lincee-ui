import { Routes } from '@angular/router';
import { HomeComponent } from './components/pages/home/home.component';
import { LayoutComponent } from './components/layout/layout.component';
import { CartComponent } from './components/pages/cart/cart.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', component: HomeComponent },
      { path: 'cart', component: CartComponent },
    ]
  },
  { path: '**', redirectTo: '', pathMatch: 'full' } // Wildcard route
];
