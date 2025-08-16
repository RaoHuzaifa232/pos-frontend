import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Search, Plus } from 'lucide-angular';
import { PosService } from '../../services/pos.service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-product-grid',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="h-full flex flex-col bg-gray-50">
      <!-- Header with search and categories -->
      <div class="p-4 bg-white shadow-sm border-b">
        <!-- Search Bar -->
        <div class="relative mb-4">
          <lucide-icon 
            [img]="searchIcon" 
            class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5">
          </lucide-icon>
          <input
            type="text"
            [(ngModel)]="searchQuery"
            (input)="onSearchChange()"
            placeholder="Search products or scan barcode..."
            class="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
        </div>

        <!-- Category Filters -->
        <div class="flex gap-2 overflow-x-auto pb-2">
          <button
            (click)="selectedCategory.set('all')"
            [class]="'px-4 py-2 rounded-lg font-medium transition-all duration-200 whitespace-nowrap ' + 
                     (selectedCategory() === 'all' ? 'bg-blue-500 text-white shadow-lg' : 'bg-gray-100 text-gray-700 hover:bg-gray-200')"
          >
            All Products
          </button>
          <button
            *ngFor="let category of posService.allCategories()"
            (click)="selectedCategory.set(category.name)"
            [class]="'px-4 py-2 rounded-lg font-medium transition-all duration-200 whitespace-nowrap ' + 
                     (selectedCategory() === category.name ? category.color + ' text-white shadow-lg' : 'bg-gray-100 text-gray-700 hover:bg-gray-200')"
          >
            {{ category.name }}
          </button>
        </div>
      </div>

      <!-- Products Grid -->
      <div class="flex-1 p-4 overflow-y-auto">
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          <div
            *ngFor="let product of filteredProducts(); trackBy: trackByProductId"
            (click)="addToCart(product)"
            class="bg-white rounded-xl p-4 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:scale-105 border border-gray-100"
          >
            <!-- Product Image Placeholder -->
            <div class="w-full h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg mb-3 flex items-center justify-center">
              <span class="text-2xl">🛍️</span>
            </div>

            <!-- Product Info -->
            <div class="space-y-2">
              <h3 class="font-semibold text-gray-800 text-sm line-clamp-2">{{ product.name }}</h3>
              <p class="text-xs text-gray-500">{{ product.category }}</p>
              <div class="flex items-center justify-between">
                <span class="text-lg font-bold text-green-600">\${{ product.price | number:'1.2-2' }}</span>
                <span class="text-xs text-gray-400">Stock: {{ product.stock }}</span>
              </div>
            </div>

            <!-- Add Button -->
            <button class="w-full mt-3 bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2">
              <lucide-icon [img]="plusIcon" class="w-4 h-4"></lucide-icon>
              Add to Cart
            </button>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="filteredProducts().length === 0" class="text-center py-12">
          <div class="text-6xl mb-4">🔍</div>
          <h3 class="text-xl font-semibold text-gray-600 mb-2">No products found</h3>
          <p class="text-gray-500">Try adjusting your search or category filter</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `]
})
export class ProductGridComponent {
  readonly searchIcon = Search;
  readonly plusIcon = Plus;
  
  searchQuery = signal('');
  selectedCategory = signal('all');

  constructor(public posService: PosService) {}

  filteredProducts = computed(() => {
    let products = this.posService.allProducts();
    
    // Filter by category
    if (this.selectedCategory() !== 'all') {
      products = products.filter(p => p.category === this.selectedCategory());
    }
    
    // Filter by search query
    const query = this.searchQuery().toLowerCase().trim();
    if (query) {
      products = products.filter(p =>
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
    this.posService.addToCart(product);
  }

  trackByProductId(index: number, product: Product): string {
    return product.id;
  }
}