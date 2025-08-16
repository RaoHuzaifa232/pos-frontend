import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Store, History, Settings, BarChart3, Package, ShoppingCart, Users, CreditCard, RotateCcw, Tag } from 'lucide-angular';
import { ProductGridComponent } from '../product-grid/product-grid.component';
import { CartComponent } from '../cart/cart.component';
import { PaymentComponent } from '../payment/payment.component';
import { ReceiptComponent } from '../receipt/receipt.component';
import { OrderHistoryComponent } from '../order-history/order-history.component';
import { InventoryDashboardComponent } from '../inventory-dashboard/inventory-dashboard.component';
import { ProductManagementComponent } from '../product-management/product-management.component';
import { PurchaseManagementComponent } from '../purchase-management/purchase-management.component';
import { StockManagementComponent } from '../stock-management/stock-management.component';
import { SalesReturnsComponent } from '../sales-returns/sales-returns.component';
import { PurchaseReturnsComponent } from '../purchase-returns/purchase-returns.component';
import { CategoryManagementComponent } from '../category-management/category-management.component';
import { SupplierManagementComponent } from '../supplier-management/supplier-management.component';
import { NotificationsComponent } from '../notifications/notifications.component';
import { PosService } from '../../services/pos.service';
import { InventoryService } from '../../services/inventory.service';
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
    OrderHistoryComponent,
    InventoryDashboardComponent,
    ProductManagementComponent,
    PurchaseManagementComponent,
    StockManagementComponent,
    SalesReturnsComponent,
    PurchaseReturnsComponent,
    CategoryManagementComponent,
    SupplierManagementComponent,
    NotificationsComponent
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
          
          <div class="flex items-center gap-2">
            <button
              (click)="activeTab.set('dashboard')"
              [class]="'flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 ' +
                       (activeTab() === 'dashboard' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100')"
            >
              <lucide-icon [img]="analyticsIcon" class="w-4 h-4"></lucide-icon>
              Dashboard
            </button>

            <button
              (click)="activeTab.set('sales')"
              [class]="'flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 ' +
                       (activeTab() === 'sales' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100')"
            >
              <lucide-icon [img]="storeIcon" class="w-4 h-4"></lucide-icon>
              Sales
            </button>

            <button
              (click)="activeTab.set('products')"
              [class]="'flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 ' +
                       (activeTab() === 'products' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100')"
            >
              <lucide-icon [img]="packageIcon" class="w-4 h-4"></lucide-icon>
              Products
            </button>

            <button
              (click)="activeTab.set('purchases')"
              [class]="'flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 ' +
                       (activeTab() === 'purchases' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100')"
            >
              <lucide-icon [img]="shoppingCartIcon" class="w-4 h-4"></lucide-icon>
              Purchases
            </button>

            <button
              (click)="activeTab.set('stock')"
              [class]="'flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 ' +
                       (activeTab() === 'stock' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100')"
            >
              <lucide-icon [img]="packageIcon" class="w-4 h-4"></lucide-icon>
              Stock
            </button>

            <button
              (click)="activeTab.set('sales-returns')"
              [class]="'flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 ' +
                       (activeTab() === 'sales-returns' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100')"
            >
              <lucide-icon [img]="returnIcon" class="w-4 h-4"></lucide-icon>
              Returns
            </button>

            <button
              (click)="activeTab.set('categories')"
              [class]="'flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 ' +
                       (activeTab() === 'categories' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100')"
            >
              <lucide-icon [img]="tagIcon" class="w-4 h-4"></lucide-icon>
              Categories
            </button>

            <button
              (click)="activeTab.set('suppliers')"
              [class]="'flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 ' +
                       (activeTab() === 'suppliers' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100')"
            >
              <lucide-icon [img]="usersIcon" class="w-4 h-4"></lucide-icon>
              Suppliers
            </button>
            
            <button
              (click)="activeTab.set('history')"
              [class]="'flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 ' +
                       (activeTab() === 'history' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100')"
            >
              <lucide-icon [img]="historyIcon" class="w-4 h-4"></lucide-icon>
              History
            </button>
            
            <button
              (click)="activeTab.set('settings')"
              [class]="'flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 ' +
                       (activeTab() === 'settings' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100')"
            >
              <lucide-icon [img]="settingsIcon" class="w-4 h-4"></lucide-icon>
              Settings
            </button>
          </div>
        </div>
      </nav>

      <!-- Main Content -->
      <div class="flex-1 flex overflow-hidden">
        <!-- Dashboard View -->
        <div *ngIf="activeTab() === 'dashboard'" class="flex-1 overflow-y-auto bg-gray-50">
          <app-inventory-dashboard></app-inventory-dashboard>
        </div>

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

        <!-- Products Management View -->
        <div *ngIf="activeTab() === 'products'" class="flex-1 bg-gray-50">
          <app-product-management></app-product-management>
        </div>

        <!-- Purchases Management View -->
        <div *ngIf="activeTab() === 'purchases'" class="flex-1 bg-gray-50">
          <app-purchase-management></app-purchase-management>
        </div>

        <!-- Stock Management View -->
        <div *ngIf="activeTab() === 'stock'" class="flex-1 bg-gray-50">
          <app-stock-management></app-stock-management>
        </div>

        <!-- Sales Returns View -->
        <div *ngIf="activeTab() === 'sales-returns'" class="flex-1 bg-gray-50">
          <div class="h-full flex">
            <div class="flex-1">
              <app-sales-returns></app-sales-returns>
            </div>
            <div class="w-px bg-gray-200"></div>
            <div class="flex-1">
              <app-purchase-returns></app-purchase-returns>
            </div>
          </div>
        </div>

        <!-- Categories Management View -->
        <div *ngIf="activeTab() === 'categories'" class="flex-1 bg-gray-50">
          <app-category-management></app-category-management>
        </div>

        <!-- Suppliers Management View -->
        <div *ngIf="activeTab() === 'suppliers'" class="flex-1 bg-gray-50">
          <app-supplier-management></app-supplier-management>
        </div>

        <!-- History View -->
        <div *ngIf="activeTab() === 'history'" class="flex-1">
          <div class="bg-white h-full">
            <app-order-history></app-order-history>
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

    <!-- Notifications -->
    <app-notifications></app-notifications>
  `
})
export class PosLayoutComponent {
  readonly storeIcon = Store;
  readonly historyIcon = History;
  readonly settingsIcon = Settings;
  readonly analyticsIcon = BarChart3;
  readonly packageIcon = Package;
  readonly shoppingCartIcon = ShoppingCart;
  readonly usersIcon = Users;
  readonly creditCardIcon = CreditCard;
  readonly returnIcon = RotateCcw;
  readonly tagIcon = Tag;

  activeTab = signal<'dashboard' | 'sales' | 'products' | 'purchases' | 'stock' | 'sales-returns' | 'purchase-returns' | 'categories' | 'suppliers' | 'history' | 'settings'>('dashboard');
  showPayment = signal<boolean>(false);
  showReceipt = signal<boolean>(false);
  completedOrder = signal<Order | null>(null);

  constructor(private posService: PosService, private inventoryService: InventoryService) {}

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