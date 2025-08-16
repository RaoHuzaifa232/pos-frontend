import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, X, CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-angular';
import { NotificationService, Notification } from '../../services/notification.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      <div
        *ngFor="let notification of notificationService.allNotifications(); trackBy: trackByNotificationId"
        [class]="'rounded-lg shadow-lg border p-4 transition-all duration-300 transform ' + getNotificationClass(notification.type)"
      >
        <div class="flex items-start gap-3">
          <!-- Icon -->
          <div class="flex-shrink-0">
            <lucide-icon [img]="getNotificationIcon(notification.type)" class="w-5 h-5"></lucide-icon>
          </div>
          
          <!-- Content -->
          <div class="flex-1 min-w-0">
            <h4 class="font-semibold text-sm">{{ notification.title }}</h4>
            <p class="text-sm mt-1 opacity-90">{{ notification.message }}</p>
            <p class="text-xs mt-2 opacity-75">{{ notification.timestamp | date:'short' }}</p>
          </div>
          
          <!-- Close Button -->
          <button
            (click)="closeNotification(notification.id)"
            class="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
          >
            <lucide-icon [img]="closeIcon" class="w-4 h-4"></lucide-icon>
          </button>
        </div>
      </div>
    </div>
  `
})
export class NotificationsComponent {
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