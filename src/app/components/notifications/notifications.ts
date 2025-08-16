import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, X, CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-angular';
import { NotificationService, Notification } from '../../services/notification.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './notifications.html'
})
export class Notifications {
  readonly closeIcon = X;
  readonly successIcon = CheckCircle;
  readonly warningIcon = AlertTriangle;
  readonly errorIcon = XCircle;
  readonly infoIcon = Info;

  notificationService = inject(NotificationService);

  getNotificationClass(type: string): string {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'warning':
        return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  }

  getNotificationIcon(type: string) {
    switch (type) {
      case 'success':
        return this.successIcon;
      case 'warning':
        return this.warningIcon;
      case 'error':
        return this.errorIcon;
      case 'info':
        return this.infoIcon;
      default:
        return this.infoIcon;
    }
  }

  closeNotification(id: string) {
    this.notificationService.removeNotification(id);
  }

  trackByNotificationId(index: number, notification: Notification): string {
    return notification.id;
  }
}