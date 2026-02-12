import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  toasts = signal<Toast[]>([]);
  private toastIdCounter = 0;

  addToast(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', duration = 4000) {
    const id = `toast-${++this.toastIdCounter}`;
    const toast: Toast = { id, message, type, duration };
    
    this.toasts.update(toasts => [...toasts, toast]);

    if (duration) {
      setTimeout(() => this.removeToast(id), duration);
    }

    return id;
  }

  success(message: string, duration?: number) {
    return this.addToast(message, 'success', duration);
  }

  error(message: string, duration?: number) {
    return this.addToast(message, 'error', duration);
  }

  warning(message: string, duration?: number) {
    return this.addToast(message, 'warning', duration);
  }

  info(message: string, duration?: number) {
    return this.addToast(message, 'info', duration);
  }

  removeToast(id: string) {
    this.toasts.update(toasts => toasts.filter(t => t.id !== id));
  }

  clearAll() {
    this.toasts.set([]);
  }
}
