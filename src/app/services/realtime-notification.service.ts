import { Injectable, signal, inject } from '@angular/core';
import { AuthService } from './auth.service';

export interface RealtimeNotification {
  id: string;
  type: 'order_update' | 'payment_confirmation' | 'shipment' | 'system' | 'promotion';
  title: string;
  message: string;
  data?: Record<string, any>;
  timestamp: Date;
  read: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class RealtimeNotificationService {
  private authService = inject(AuthService);
  private ws: WebSocket | null = null;
  private baseUrl = 'wss://linceecom-production.up.railway.app';

  notifications = signal<RealtimeNotification[]>([]);
  isConnected = signal(false);
  unreadCount = signal(0);

  connect() {
    if (!this.authService.isAuthenticated()) {
      return;
    }

    const token = localStorage.getItem('auth_token');
    if (!token) return;

    try {
      this.ws = new WebSocket(`${this.baseUrl}/ws/notifications?token=${token}`);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.isConnected.set(true);
      };

      this.ws.onmessage = (event) => {
        try {
          const notification: RealtimeNotification = JSON.parse(event.data);
          notification.timestamp = new Date(notification.timestamp);
          notification.read = false;

          this.notifications.update(notifs => [notification, ...notifs]);
          this.updateUnreadCount();

          console.log('Notification received:', notification);
        } catch (e) {
          console.error('Error parsing notification:', e);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.isConnected.set(false);
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.isConnected.set(false);
        // Attempt to reconnect after 5 seconds
        setTimeout(() => this.connect(), 5000);
      };
    } catch (e) {
      console.error('Failed to connect WebSocket:', e);
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected.set(false);
  }

  markAsRead(notificationId: string) {
    this.notifications.update(notifs => 
      notifs.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
    this.updateUnreadCount();
  }

  markAllAsRead() {
    this.notifications.update(notifs => 
      notifs.map(n => ({ ...n, read: true }))
    );
    this.updateUnreadCount();
  }

  deleteNotification(notificationId: string) {
    this.notifications.update(notifs => 
      notifs.filter(n => n.id !== notificationId)
    );
    this.updateUnreadCount();
  }

  clearAll() {
    this.notifications.set([]);
    this.updateUnreadCount();
  }

  private updateUnreadCount() {
    const count = this.notifications().filter(n => !n.read).length;
    this.unreadCount.set(count);
  }

  sendNotification(type: RealtimeNotification['type'], title: string, message: string, data?: Record<string, any>) {
    const notification: RealtimeNotification = {
      id: `notif-${Date.now()}`,
      type,
      title,
      message,
      data,
      timestamp: new Date(),
      read: false
    };
    
    this.notifications.update(notifs => [notification, ...notifs]);
    this.updateUnreadCount();
  }
}
