import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  LucideAngularModule,
  Plus,
  Search,
  Edit,
  Trash2,
  Tag,
  Package,
} from 'lucide-angular';
import { InventoryService } from '../../services/inventory.service';
import { Category } from '../../models/product.model';

@Component({
  selector: 'app-category-management',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './category-management.html',
})
export class CategoryManagement {
  readonly plusIcon = Plus;
  readonly searchIcon = Search;
  readonly editIcon = Edit;
  readonly trashIcon = Trash2;
  readonly tagIcon = Tag;
  readonly packageIcon = Package;

  searchQuery = signal('');
  showAddForm = signal(false);
  editingCategory = signal<Category | null>(null);

  categoryForm = {
    name: '',
    description: '',
    color: 'bg-blue-500',
  };

  colorOptions = [
    { name: 'Blue', class: 'bg-blue-500' },
    { name: 'Green', class: 'bg-green-500' },
    { name: 'Purple', class: 'bg-purple-500' },
    { name: 'Red', class: 'bg-red-500' },
    { name: 'Yellow', class: 'bg-yellow-500' },
    { name: 'Pink', class: 'bg-pink-500' },
    { name: 'Indigo', class: 'bg-indigo-500' },
    { name: 'Orange', class: 'bg-orange-500' },
    { name: 'Teal', class: 'bg-teal-500' },
    { name: 'Cyan', class: 'bg-cyan-500' },
    { name: 'Emerald', class: 'bg-emerald-500' },
    { name: 'Rose', class: 'bg-rose-500' },
  ];

  constructor(public inventoryService: InventoryService) {}

  filteredCategories = computed(() => {
    let categories = this.inventoryService.allCategories();

    const query = this.searchQuery().toLowerCase().trim();
    if (query) {
      categories = categories.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.description?.toLowerCase().includes(query)
      );
    }

    return categories.sort((a, b) => a.name.localeCompare(b.name));
  });

  onSearchChange() {
    // Trigger reactivity
  }

  getProductCount(categoryName: string): number {
    return this.inventoryService.getProductsByCategory(categoryName).length;
  }

  getTotalStock(categoryName: string): number {
    return this.inventoryService
      .getProductsByCategory(categoryName)
      .reduce((total, product) => total + product.stock, 0);
  }

  getStockValue(categoryName: string): number {
    return this.inventoryService
      .getProductsByCategory(categoryName)
      .reduce((total, product) => total + product.stock * product.costPrice, 0);
  }

  editCategory(category: Category) {
    this.editingCategory.set(category);
    this.categoryForm = {
      name: category.name,
      description: category.description || '',
      color: category.color,
    };
  }

  deleteCategory(id: string) {
    const category = this.inventoryService.allCategories().find(c => c._id === id);
    if (!category) return;

    const productCount = this.getProductCount(category.name);
    if (productCount > 0) {
      alert(`Cannot delete category "${category.name}" because it contains ${productCount} product(s). Please move or delete the products first.`);
      return;
    }

    if (confirm(`Are you sure you want to delete the category "${category.name}"?`)) {
      this.inventoryService.deleteCategory(id);
    }
  }

  saveCategory() {
    if (this.editingCategory()) {
      // Update existing category
      this.inventoryService.updateCategory(this.editingCategory()!._id, {
        name: this.categoryForm.name,
        description: this.categoryForm.description,
        color: this.categoryForm.color,
      });
    } else {
      // Add new category
      this.inventoryService.addCategory({
        name: this.categoryForm.name,
        description: this.categoryForm.description,
        color: this.categoryForm.color,
      });
    }

    this.cancelForm();
  }

  cancelForm() {
    this.showAddForm.set(false);
    this.editingCategory.set(null);
    this.categoryForm = {
      name: '',
      description: '',
      color: 'bg-blue-500',
    };
  }

  trackByCategoryId(index: number, category: Category): string {
    return category._id;
  }
}
