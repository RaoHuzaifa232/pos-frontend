import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  TriangleAlert,
  SquarePen,
  LucideAngularModule,
  Minus,
  Package,
  Plus,
  Search,
} from 'lucide-angular';
import { Product } from '../../models/product.model';
import { InventoryService } from '../../services/inventory.service';

@Component({
  selector: 'app-stock-management',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './stock-management.html',
})
export class StockManagement {
  readonly packageIcon = Package;
  readonly plusIcon = Plus;
  readonly minusIcon = Minus;
  readonly editIcon = SquarePen;
  readonly searchIcon = Search;
  readonly alertIcon = TriangleAlert;

  searchQuery = signal('');
  adjustingProduct = signal<Product | null>(null);

  adjustmentForm = {
    newStock: 0,
    reason: '',
    customReason: '',
  };

  constructor(public inventoryService: InventoryService) {}

  filteredProducts = computed(() => {
    let products = this.inventoryService.allProducts();

    const query = this.searchQuery().toLowerCase().trim();
    if (query) {
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query) ||
          p.barcode?.includes(query)
      );
    }

    return products.sort((a, b) => {
      // Sort by stock status: out of stock first, then low stock, then normal
      if (a.stock === 0 && b.stock > 0) return -1;
      if (a.stock > 0 && b.stock === 0) return 1;
      if (a.stock <= a.minStock && b.stock > b.minStock) return -1;
      if (a.stock > a.minStock && b.stock <= b.minStock) return 1;
      return a.name.localeCompare(b.name);
    });
  });

  onSearchChange() {
    // Trigger reactivity
  }

  getStockStatusColor(product: Product): string {
    if (product.stock === 0) return 'text-red-600';
    if (product.stock <= product.minStock) return 'text-orange-600';
    return 'text-green-600';
  }

  openAdjustModal(product: Product) {
    this.adjustingProduct.set(product);
    this.adjustmentForm.newStock = product.stock;
    this.adjustmentForm.reason = '';
    this.adjustmentForm.customReason = '';
  }

  getAdjustmentDifference(): number {
    const product = this.adjustingProduct();
    if (!product) return 0;
    return this.adjustmentForm.newStock - product.stock;
  }

  saveStockAdjustment() {
    const product = this.adjustingProduct();
    if (!product) return;

    const reason =
      this.adjustmentForm.reason === 'Other'
        ? this.adjustmentForm.customReason
        : this.adjustmentForm.reason;

    this.inventoryService.adjustStock(
      product._id,
      this.adjustmentForm.newStock,
      reason
    );

    this.cancelAdjustment();
  }

  cancelAdjustment() {
    this.adjustingProduct.set(null);
    this.adjustmentForm = {
      newStock: 0,
      reason: '',
      customReason: '',
    };
  }
}
