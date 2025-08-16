import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Store, History, Settings, BarChart3, Package, ShoppingCart, Users, CreditCard, RotateCcw, Tag } from 'lucide-angular';
import { ProductGrid } from '../product-grid/product-grid';
import { Cart } from '../cart/cart';
import { Payment } from '../payment/payment';
import { Receipt } from '../receipt/receipt';
import { OrderHistory } from '../order-history/order-history';
import { InventoryDashboard } from '../inventory-dashboard/inventory-dashboard';
import { ProductManagement } from '../product-management/product-management';
import { PurchaseManagement } from '../purchase-management/purchase-management';
import { StockManagement } from '../stock-management/stock-management';
import { SalesReturns } from '../sales-returns/sales-returns';
import { PurchaseReturns } from '../purchase-returns/purchase-returns';
import { CategoryManagement } from '../category-management/category-management';
import { SupplierManagement } from '../supplier-management/supplier-management';
import { Notifications } from '../notifications/notifications';
import { PosService } from '../../services/pos.service';
import { InventoryService } from '../../services/inventory.service';
import { Order } from '../../models/product.model';

@Component({
  selector: 'app-pos-layout',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule,
    ProductGrid,
    Cart,
    Payment,
    Receipt,
    OrderHistory,
    InventoryDashboard,
    ProductManagement,
    PurchaseManagement,
    StockManagement,
    SalesReturns,
    PurchaseReturns,
    CategoryManagement,
    SupplierManagement,
    Notifications
  ],
  templateUrl: './pos-layout.html'
})
export class PosLayout {
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