import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Plus, Search, Edit, Trash2, Package, AlertTriangle } from 'lucide-angular';
import { InventoryService } from '../../services/inventory.service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-product-management',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './product-management.html'
})
export class ProductManagement {
  readonly plusIcon = Plus;
  readonly searchIcon = Search;
  readonly editIcon = Edit;
  readonly trashIcon = Trash2;
  readonly packageIcon = Package;
  readonly alertIcon = AlertTriangle;

  searchQuery = signal('');
  selectedCategory = signal('');
  stockFilter = signal('');
  showAddForm = signal(false);
  editingProduct = signal<Product | null>(null);

  productForm = {
    name: '',
    barcode: '',
    category: '',
    supplier: '',
    costPrice: 0,
    sellingPrice: 0,
    stock: 0,
    minStock: 0,
    description: ''
  };

  constructor(public inventoryService: InventoryService) {}

  filteredProducts = computed(() => {
    let products = this.inventoryService.allProducts();

    // Filter by search query
    const query = this.searchQuery().toLowerCase().trim();
    if (query) {
      products = products.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query) ||
        p.barcode?.includes(query) ||
        p.supplier?.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (this.selectedCategory()) {
      products = products.filter(p => p.category === this.selectedCategory());
    }

    // Filter by stock status
    const stockFilter = this.stockFilter();
    if (stockFilter === 'low') {
      products = products.filter(p => p.stock <= p.minStock && p.stock > 0);
    } else if (stockFilter === 'out') {
      products = products.filter(p => p.stock === 0);
    }

    return products;
  });

  onSearchChange() {
    // Trigger reactivity
  }

  onCategoryChange() {
    // Trigger reactivity
  }

  onStockFilterChange() {
    // Trigger reactivity
  }

  getStockStatusColor(product: Product): string {
    if (product.stock === 0) return 'text-red-600';
    if (product.stock <= product.minStock) return 'text-orange-600';
    return 'text-green-600';
  }

  editProduct(product: Product) {
    this.editingProduct.set(product);
    this.productForm = {
      name: product.name,
      barcode: product.barcode || '',
      category: product.category,
      supplier: product.supplier || '',
      costPrice: product.costPrice,
      sellingPrice: product.sellingPrice,
      stock: product.stock,
      minStock: product.minStock,
      description: product.description || ''
    };
  }

  deleteProduct(id: string) {
    if (confirm('Are you sure you want to delete this product?')) {
      this.inventoryService.deleteProduct(id);
    }
  }

  saveProduct() {
    if (this.editingProduct()) {
      // Update existing product
      this.inventoryService.updateProduct(this.editingProduct()!.id, {
        name: this.productForm.name,
        barcode: this.productForm.barcode,
        category: this.productForm.category,
        supplier: this.productForm.supplier,
        costPrice: this.productForm.costPrice,
        sellingPrice: this.productForm.sellingPrice,
        stock: this.productForm.stock,
        minStock: this.productForm.minStock,
        description: this.productForm.description
      });
    } else {
      // Add new product
      this.inventoryService.addProduct({
        name: this.productForm.name,
        barcode: this.productForm.barcode,
        category: this.productForm.category,
        supplier: this.productForm.supplier,
        costPrice: this.productForm.costPrice,
        sellingPrice: this.productForm.sellingPrice,
        stock: this.productForm.stock,
        minStock: this.productForm.minStock,
        description: this.productForm.description
      });
    }

    this.cancelForm();
  }

  cancelForm() {
    this.showAddForm.set(false);
    this.editingProduct.set(null);
    this.productForm = {
      name: '',
      barcode: '',
      category: '',
      supplier: '',
      costPrice: 0,
      sellingPrice: 0,
      stock: 0,
      minStock: 0,
      description: ''
    };
  }

  trackByProductId(index: number, product: Product): string {
    return product.id;
  }
}