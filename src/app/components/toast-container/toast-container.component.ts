import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../services/notification.service';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      <div *ngFor="let toast of notificationService.toasts()" 
           [class]="'toast toast-' + toast.type"
           @slideIn>
        <div class="toast-content">
          <span class="toast-icon">
            <ng-container [ngSwitch]="toast.type">
              <svg *ngSwitchCase="'success'" class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <svg *ngSwitchCase="'error'" class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line>
              </svg>
              <svg *ngSwitchCase="'warning'" class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3.05h16.94a2 2 0 0 0 1.71-3.05L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
              <svg *ngSwitchCase="'info'" class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
            </ng-container>
          </span>
          <span class="toast-message">{{ toast.message }}</span>
        </div>
        <button class="toast-close" (click)="notificationService.removeToast(toast.id)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 12px;
      max-width: 400px;
    }

    .toast {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 16px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      font-size: 14px;
      font-weight: 500;
      backdrop-filter: blur(10px);
      animation: slideIn 0.3s ease-out;
    }

    .toast-success {
      background: rgba(34, 197, 94, 0.95);
      color: #fff;
    }

    .toast-error {
      background: rgba(239, 68, 68, 0.95);
      color: #fff;
    }

    .toast-warning {
      background: rgba(251, 146, 60, 0.95);
      color: #fff;
    }

    .toast-info {
      background: rgba(59, 130, 246, 0.95);
      color: #fff;
    }

    .toast-content {
      display: flex;
      align-items: center;
      gap: 12px;
      flex: 1;
    }

    .toast-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .icon {
      width: 20px;
      height: 20px;
      stroke-width: 2;
    }

    .toast-message {
      flex: 1;
      line-height: 1.4;
    }

    .toast-close {
      flex-shrink: 0;
      background: none;
      border: none;
      color: inherit;
      cursor: pointer;
      padding: 4px;
      margin-left: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0.8;
      transition: opacity 0.2s;
    }

    .toast-close:hover {
      opacity: 1;
    }

    .toast-close svg {
      width: 18px;
      height: 18px;
      stroke-width: 2;
    }

    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    @media (max-width: 640px) {
      .toast-container {
        left: 10px;
        right: 10px;
        top: 10px;
        max-width: none;
      }
    }
  `],
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateX(400px)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'translateX(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms ease-out', style({ transform: 'translateX(400px)', opacity: 0 }))
      ])
    ])
  ]
})
export class ToastContainerComponent {
  notificationService = inject(NotificationService);
}
