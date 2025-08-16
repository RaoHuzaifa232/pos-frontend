import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Store, History, Settings, BarChart3 } from 'lucide-angular';
import { ProductGridComponent } from '../product-grid/product-grid.component';
import { CartComponent } from '../cart/cart.component';
import { PaymentComponent } from '../payment/payment.component';
import { ReceiptComponent } from '../receipt/receipt.component';
import { OrderHistoryComponent } from '../order-history/order-history.component';
import { PosService } from '../../services/pos.service';
import { Order } from '../../models/product.model';

@Component({
  selector: 'app-pos-layout',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule,
    ProductGridComponent,
    CartComponent,
    PaymentComponent,
    ReceiptComponent,
    OrderHistoryComponent
  ],
  template: `
    <div class="h-screen flex flex-col bg-gray-100">
      <!-- Top Navigation -->
      <nav class="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <lucide-icon [img]="storeIcon" class="w-8 h-8 text-blue-600"></lucide-icon>
            <h1 class="text-2xl font-bold text-gray-800">POS System</h1>
          </div>
          
          <div class="flex items-center gap-4">
            <button
              (click)="activeTab.set('sales')"
              [class]="'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ' +
                       (activeTab() === 'sales' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100')"
            >
              <lucide-icon [img]="storeIcon" class="w-5 h-5"></lucide-icon>
              Sales
            </button>
            
            <button
              (click)="activeTab.set('history')"
              [class]="'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ' +
                       (activeTab() === 'history' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100')"
            >
              <lucide-icon [img]="historyIcon" class="w-5 h-5"></lucide-icon>
              History
            </button>
            
            <button
              (click)="activeTab.set('analytics')"
              [class]="'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ' +
                       (activeTab() === 'analytics' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100')"
            >
              <lucide-icon [img]="analyticsIcon" class="w-5 h-5"></lucide-icon>
              Analytics
            </button>
            
            <button
              (click)="activeTab.set('settings')"
              [class]="'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ' +
                       (activeTab() === 'settings' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100')"
            >
              <lucide-icon [img]="settingsIcon" class="w-5 h-5"></lucide-icon>
              Settings
            </button>
          </div>
        </div>
      </nav>

      <!-- Main Content -->
      <div class="flex-1 flex overflow-hidden">
        <!-- Sales View -->
        <div *ngIf="activeTab() === 'sales'" class="flex-1 flex">
          <!-- Products Section -->
          <div class="flex-1">
            <app-product-grid></app-product-grid>
          </div>
          
          <!-- Cart Section -->
          <div class="w-96 border-l border-gray-200">
            <app-cart (proceedToPayment)="showPayment.set(true)"></app-cart>
          </div>
        </div>

        <!-- History View -->
        <div *ngIf="activeTab() === 'history'" class="flex-1">
          <div class="bg-white h-full">
            <app-order-history></app-order-history>
          </div>
        </div>

        <!-- Analytics View -->
        <div *ngIf="activeTab() === 'analytics'" class="flex-1 p-6">
          <div class="bg-white rounded-xl shadow-sm h-full">
            <div class="p-6 border-b border-gray-200">
              <h2 class="text-xl font-bold text-gray-800">Analytics</h2>
            </div>
            <div class="p-6">
              <div class="text-center py-12">
                <div class="text-6xl mb-4">📊</div>
                <h3 class="text-lg font-semibold text-gray-600 mb-2">Analytics dashboard</h3>
                <p class="text-gray-500">Sales analytics and reports will be displayed here</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Settings View -->
        <div *ngIf="activeTab() === 'settings'" class="flex-1 p-6">
          <div class="bg-white rounded-xl shadow-sm h-full">
            <div class="p-6 border-b border-gray-200">
              <h2 class="text-xl font-bold text-gray-800">Settings</h2>
            </div>
            <div class="p-6">
              <div class="text-center py-12">
                <div class="text-6xl mb-4">⚙️</div>
                <h3 class="text-lg font-semibold text-gray-600 mb-2">System Settings</h3>
                <p class="text-gray-500">Configure your POS system settings here</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Payment Modal -->
    <app-payment
      *ngIf="showPayment()"
      (paymentComplete)="onPaymentComplete()"
      (paymentCancelled)="onPaymentCancelled()"
    ></app-payment>

    <!-- Receipt Modal -->
    <app-receipt
      *ngIf="showReceipt() && completedOrder()"
      [order]="completedOrder()!"
      (receiptClosed)="onReceiptClosed()"
    ></app-receipt>
  `
})
export class PosLayoutComponent {
  readonly storeIcon = Store;
  readonly historyIcon = History;
  readonly settingsIcon = Settings;
  readonly analyticsIcon = BarChart3;

  activeTab = signal<'sales' | 'history' | 'analytics' | 'settings'>('sales');
  showPayment = signal<boolean>(false);
  showReceipt = signal<boolean>(false);
  completedOrder = signal<Order | null>(null);

  constructor(private posService: PosService) {}

  onPaymentComplete() {
    this.showPayment.set(false);
    // Get the most recent order from the service
    const orders = this.posService.allOrders();
    if (orders.length > 0) {
      this.completedOrder.set(orders[0]);
      setTimeout(() => {
        this.showReceipt.set(true);
      }, 500);
    }
  }

  onPaymentCancelled() {
    this.showPayment.set(false);
  }

  onReceiptClosed() {
    this.showReceipt.set(false);
    this.completedOrder.set(null);
  }
}