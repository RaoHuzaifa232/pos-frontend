import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Search, Plus } from 'lucide-angular';
import { PosService } from '../../services/pos.service';
import { InventoryService } from '../../services/inventory.service';
import { StockStatus } from '../stock-status/stock-status';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-product-grid',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, StockStatus],
  templateUrl: './product-grid.html',
  styles: [
    `
      .line-clamp-2 {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
    `,
  ],
})
export class ProductGrid {
  readonly searchIcon = Search;
  readonly plusIcon = Plus;

  searchQuery = signal('');
  selectedCategory = signal('all');

  constructor(
    public posService: PosService,
    public inventoryService: InventoryService
  ) {}

  filteredProducts = computed(() => {
    let products = this.inventoryService.allProducts();

    // Filter by category
    if (this.selectedCategory() !== 'all') {
      products = products.filter((p) => p.category === this.selectedCategory());
    }

    // Filter by search query
    const query = this.searchQuery().toLowerCase().trim();
    if (query) {
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query) ||
          p.barcode?.includes(query)
      );
    }

    return products;
  });

  onSearchChange() {
    // Trigger reactivity - the computed signal will automatically update
  }

  addToCart(product: Product) {
    try {
      this.posService.addToCart(product);
    } catch (error: any) {
      alert(error.message || 'Unable to add product to cart');
    }
  }

  trackByProductId(index: number, product: Product): string {
    return product._id;
  }
}
