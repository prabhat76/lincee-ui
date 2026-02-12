import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastContainerComponent } from './components/toast-container/toast-container.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastContainerComponent],
  template: `
    <app-toast-container></app-toast-container>
    <router-outlet></router-outlet>
  `,
  styleUrls: []
})
export class AppComponent {}