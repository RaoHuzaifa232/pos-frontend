import { Component, Input, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, AlertTriangle, CheckCircle, XCircle } from 'lucide-angular';
import { InventoryService } from '../../services/inventory.service';

@Component({
  selector: 'app-stock-status',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="flex items-center gap-2">
      <!-- Stock Level Indicator -->
      <div [class]="'flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ' + getStatusClass()">
        <lucide-icon [img]="getStatusIcon()" class="w-3 h-3"></lucide-icon>
        <span>{{ currentStock() }}</span>
      </div>
      
      <!-- Stock Status Text -->
      <span [class]="'text-xs ' + getTextClass()">
        {{ getStatusText() }}
      </span>
    </div>
  `
})
export class StockStatusComponent {
  @Input() productId!: string;
  @Input() minStock?: number;
  
  private inventoryService = inject(InventoryService);
  
  readonly alertIcon = AlertTriangle;
  readonly checkIcon = CheckCircle;
  readonly xIcon = XCircle;

  currentStock = computed(() => {
    const product = this.inventoryService.allProducts().find(p => p.id === this.productId);
    return product ? product.stock : 0;
  });

  isLowStock = computed(() => {
    const product = this.inventoryService.allProducts().find(p => p.id === this.productId);
    return product ? product.stock <= product.minStock && product.stock > 0 : false;
  });

  isOutOfStock = computed(() => {
    const product = this.inventoryService.allProducts().find(p => p.id === this.productId);
    return product ? product.stock === 0 : true;
  });

  getStatusClass(): string {
    if (this.isOutOfStock()) {
      return 'bg-red-100 text-red-800';
    } else if (this.isLowStock()) {
      return 'bg-orange-100 text-orange-800';
    } else {
      return 'bg-green-100 text-green-800';
    }
  }

  getTextClass(): string {
    if (this.isOutOfStock()) {
      return 'text-red-600';
    } else if (this.isLowStock()) {
      return 'text-orange-600';
    } else {
      return 'text-green-600';
    }
  }

  getStatusIcon() {
    if (this.isOutOfStock()) {
      return this.xIcon;
    } else if (this.isLowStock()) {
      return this.alertIcon;
    } else {
      return this.checkIcon;
    }
  }

  getStatusText(): string {
    if (this.isOutOfStock()) {
      return 'Out of Stock';
    } else if (this.isLowStock()) {
      return 'Low Stock';
    } else {
      return 'In Stock';
    }
  }
}