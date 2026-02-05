import { Routes } from '@angular/router';
import { HomeComponent } from './components/pages/home/home.component';
// Import other page components as they are created
// e.g., import { ShopComponent } from './components/pages/shop/shop.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  // { path: 'shop', component: ShopComponent },
  // { path: 'collections', component: CollectionsComponent },
  // { path: 'about', component: AboutComponent },
  // { path: 'account', component: AccountComponent },
  // { path: 'cart', component: CartComponent },
  { path: '**', redirectTo: '', pathMatch: 'full' } // Wildcard route
];
