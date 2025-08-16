import { Injectable, signal } from '@angular/core';

export interface Notification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  autoClose?: boolean;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notifications = signal<Notification[]>([]);
  
  readonly allNotifications = this.notifications.asReadonly();

  showNotification(notification: Omit<Notification, 'id' | 'timestamp'>) {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      autoClose: notification.autoClose ?? true,
      duration: notification.duration ?? 5000
    };

    this.notifications.update(notifications => [newNotification, ...notifications]);

    // Auto-close notification if enabled
    if (newNotification.autoClose) {
      setTimeout(() => {
        this.removeNotification(newNotification.id);
      }, newNotification.duration);
    }

    return newNotification.id;
  }

  removeNotification(id: string) {
    this.notifications.update(notifications => 
      notifications.filter(n => n.id !== id)
    );
  }

  clearAllNotifications() {
    this.notifications.set([]);
  }

  // Convenience methods
  showSuccess(title: string, message: string, autoClose = true) {
    return this.showNotification({
      type: 'success',
      title,
      message,
      autoClose
    });
  }

  showWarning(title: string, message: string, autoClose = true) {
    return this.showNotification({
      type: 'warning',
      title,
      message,
      autoClose
    });
  }

  showError(title: string, message: string, autoClose = false) {
    return this.showNotification({
      type: 'error',
      title,
      message,
      autoClose
    });
  }

  showInfo(title: string, message: string, autoClose = true) {
    return this.showNotification({
      type: 'info',
      title,
      message,
      autoClose
    });
  }

  // Stock-specific notifications
  showStockAlert(productName: string, currentStock: number, minStock: number) {
    return this.showWarning(
      'Low Stock Alert',
      `${productName} is running low. Current stock: ${currentStock}, Minimum: ${minStock}`,
      false
    );
  }

  showOutOfStockAlert(productName: string) {
    return this.showError(
      'Out of Stock',
      `${productName} is out of stock and cannot be sold.`,
      false
    );
  }

  showStockUpdated(productName: string, newStock: number, operation: string) {
    return this.showSuccess(
      'Stock Updated',
      `${productName} stock updated to ${newStock} units (${operation})`,
      true
    );
  }
}