import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent, RouterModule],
  template: `
    <app-header></app-header>
    <main>
      <router-outlet></router-outlet>
    </main>
    <app-global-footer></app-global-footer>
  `,
  styles: [`
    main {
      padding-top: 60px; /* Adjust based on header height */
      min-height: calc(100vh - 160px); /* Adjust based on header/footer height */
    }
  `]
})
export class LayoutComponent {}
