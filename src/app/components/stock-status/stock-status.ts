import { CommonModule } from '@angular/common';
import { Component, Input, computed, inject } from '@angular/core';
import {
  CircleCheckBig,
  CircleX,
  LucideAngularModule,
  TriangleAlert,
} from 'lucide-angular';
import { InventoryService } from '../../services/inventory.service';

@Component({
  selector: 'app-stock-status',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './stock-status.html',
})
export class StockStatus {
  @Input() productId!: string;
  @Input() minStock?: number;

  private inventoryService = inject(InventoryService);

  readonly alertIcon = TriangleAlert;
  readonly checkIcon = CircleCheckBig;
  readonly xIcon = CircleX;

  currentStock = computed(() => {
    const product = this.inventoryService
      .allProducts()
      .find((p) => p.id === this.productId);
    return product ? product.stock : 0;
  });

  isLowStock = computed(() => {
    const product = this.inventoryService
      .allProducts()
      .find((p) => p.id === this.productId);
    return product
      ? product.stock <= product.minStock && product.stock > 0
      : false;
  });

  isOutOfStock = computed(() => {
    const product = this.inventoryService
      .allProducts()
      .find((p) => p.id === this.productId);
    return product ? product.stock === 0 : true;
  });

  getStatusClass(): string {
    if (this.isOutOfStock()) {
      return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400';
    } else if (this.isLowStock()) {
      return 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400';
    } else {
      return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400';
    }
  }

  getTextClass(): string {
    if (this.isOutOfStock()) {
      return 'text-red-600 dark:text-red-400';
    } else if (this.isLowStock()) {
      return 'text-orange-600 dark:text-orange-400';
    } else {
      return 'text-green-600 dark:text-green-400';
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
