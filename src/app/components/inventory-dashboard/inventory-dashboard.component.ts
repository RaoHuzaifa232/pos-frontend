import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Package, TrendingUp, TrendingDown, AlertTriangle, DollarSign, ShoppingCart } from 'lucide-angular';
import { InventoryService } from '../../services/inventory.service';

@Component({
    selector: 'app-inventory-dashboard',
    standalone: true,
    imports: [CommonModule, LucideAngularModule],
    template: `
    <div class="p-6 space-y-6">
      <!-- Header -->
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Inventory Dashboard</h1>
        <p class="text-gray-600">Overview of your inventory and stock levels</p>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <!-- Total Products -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Total Products</p>
              <p class="text-2xl font-bold text-gray-900">{{ inventoryReport().totalProducts }}</p>
            </div>
            <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <lucide-icon [img]="packageIcon" class="w-5 h-5 text-blue-600"></lucide-icon>
            </div>
          </div>
        </div>

        <!-- Inventory Value -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Inventory Value</p>
              <p class="text-2xl font-bold text-gray-900">\${{ inventoryReport().totalStockValue | number:'1.2-2' }}</p>
            </div>
            <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <lucide-icon [img]="dollarIcon" class="w-5 h-5 text-green-600"></lucide-icon>
            </div>
          </div>
        </div>

        <!-- Low Stock Items -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Low Stock</p>
              <p class="text-2xl font-bold text-orange-600">{{ inventoryReport().lowStockItems }}</p>
            </div>
            <div class="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <lucide-icon [img]="alertIcon" class="w-5 h-5 text-orange-600"></lucide-icon>
            </div>
          </div>
        </div>

        <!-- Out of Stock -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Out of Stock</p>
              <p class="text-2xl font-bold text-red-600">{{ inventoryReport().outOfStockItems }}</p>
            </div>
            <div class="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <lucide-icon [img]="trendingDownIcon" class="w-5 h-5 text-red-600"></lucide-icon>
            </div>
          </div>
        </div>

        <!-- Total Purchases -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Total Purchases</p>
              <p class="text-2xl font-bold text-gray-900">\${{ inventoryReport().totalPurchases | number:'1.2-2' }}</p>
            </div>
            <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <lucide-icon [img]="shoppingCartIcon" class="w-5 h-5 text-purple-600"></lucide-icon>
            </div>
          </div>
        </div>

        <!-- Sales Returns -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Sales Returns</p>
              <p class="text-2xl font-bold text-orange-600">\${{ inventoryReport().totalSalesReturns | number:'1.2-2' }}</p>
            </div>
            <div class="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <lucide-icon [img]="trendingDownIcon" class="w-5 h-5 text-orange-600"></lucide-icon>
            </div>
          </div>
        </div>

        <!-- Purchase Returns -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Purchase Returns</p>
              <p class="text-2xl font-bold text-purple-600">\${{ inventoryReport().totalPurchaseReturns | number:'1.2-2' }}</p>
            </div>
            <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <lucide-icon [img]="trendingUpIcon" class="w-5 h-5 text-purple-600"></lucide-icon>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Low Stock Alert -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="flex items-center gap-3 mb-4">
            <lucide-icon [img]="alertIcon" class="w-6 h-6 text-orange-600"></lucide-icon>
            <h3 class="text-lg font-semibold text-gray-900">Low Stock Alert</h3>
          </div>
          
          <div *ngIf="inventoryService.lowStockProducts().length === 0" class="text-center py-8">
            <div class="text-4xl mb-2">✅</div>
            <p class="text-gray-600">All products are well stocked!</p>
          </div>

          <div *ngIf="inventoryService.lowStockProducts().length > 0" class="space-y-3">
            <div
              *ngFor="let product of inventoryService.lowStockProducts().slice(0, 5)"
              class="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200"
            >
              <div>
                <p class="font-medium text-gray-900">{{ product.name }}</p>
                <p class="text-sm text-gray-600">{{ product.category }}</p>
              </div>
              <div class="text-right">
                <p class="text-sm font-medium text-orange-600">{{ product.stock }} left</p>
                <p class="text-xs text-gray-500">Min: {{ product.minStock }}</p>
              </div>
            </div>
            
            <div *ngIf="inventoryService.lowStockProducts().length > 5" class="text-center">
              <p class="text-sm text-gray-500">
                +{{ inventoryService.lowStockProducts().length - 5 }} more items need restocking
              </p>
            </div>
          </div>
        </div>

        <!-- Recent Stock Movements -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="flex items-center gap-3 mb-4">
            <lucide-icon [img]="packageIcon" class="w-6 h-6 text-blue-600"></lucide-icon>
            <h3 class="text-lg font-semibold text-gray-900">Recent Stock Movements</h3>
          </div>
          
          <div *ngIf="inventoryService.allStockMovements().length === 0" class="text-center py-8">
            <div class="text-4xl mb-2">📦</div>
            <p class="text-gray-600">No stock movements yet</p>
          </div>

          <div *ngIf="inventoryService.allStockMovements().length > 0" class="space-y-3">
            <div
              *ngFor="let movement of inventoryService.allStockMovements().slice(0, 5)"
              class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div>
                <p class="font-medium text-gray-900">{{ movement.productName }}</p>
                <p class="text-sm text-gray-600">{{ movement.reason }}</p>
              </div>
              <div class="text-right">
                <p [class]="'text-sm font-medium ' + (movement.type === 'in' ? 'text-green-600' : movement.type === 'out' ? 'text-red-600' : 'text-blue-600')">
                  {{ movement.type === 'in' ? '+' : movement.type === 'out' ? '-' : '±' }}{{ movement.quantity }}
                </p>
                <p class="text-xs text-gray-500">{{ movement.timestamp | date:'short' }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Category Overview -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Category Overview</h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            *ngFor="let category of inventoryService.allCategories()"
            class="p-4 rounded-lg border border-gray-200"
          >
            <div class="flex items-center gap-3 mb-2">
              <div [class]="'w-4 h-4 rounded-full ' + category.color"></div>
              <h4 class="font-medium text-gray-900">{{ category.name }}</h4>
            </div>
            <p class="text-2xl font-bold text-gray-900">
              {{ getProductCountByCategory(category.name) }}
            </p>
            <p class="text-sm text-gray-600">products</p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class InventoryDashboardComponent {
    readonly packageIcon = Package;
    readonly dollarIcon = DollarSign;
    readonly alertIcon = AlertTriangle;
    readonly trendingUpIcon = TrendingUp;
    readonly trendingDownIcon = TrendingDown;
    readonly shoppingCartIcon = ShoppingCart;

    constructor(public inventoryService: InventoryService) { }

    inventoryReport = computed(() => this.inventoryService.getInventoryReport());

    getProductCountByCategory(categoryName: string): number {
        return this.inventoryService.getProductsByCategory(categoryName).length;
    }
}