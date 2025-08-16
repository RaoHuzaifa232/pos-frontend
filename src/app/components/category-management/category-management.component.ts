import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Plus, Search, Edit, Trash2, Tag, Package } from 'lucide-angular';
import { InventoryService } from '../../services/inventory.service';
import { Category } from '../../models/product.model';

@Component({
  selector: 'app-category-management',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="h-full flex flex-col">
      <!-- Header -->
      <div class="p-6 border-b border-gray-200 bg-white">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h2 class="text-2xl font-bold text-gray-900">Category Management</h2>
            <p class="text-gray-600">Organize your products into categories</p>
          </div>
          <button
            (click)="showAddForm.set(true)"
            class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
          >
            <lucide-icon [img]="plusIcon" class="w-5 h-5"></lucide-icon>
            Add Category
          </button>
        </div>

        <!-- Search -->
        <div class="relative">
          <lucide-icon [img]="searchIcon" class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"></lucide-icon>
          <input
            type="text"
            [(ngModel)]="searchQuery"
            (input)="onSearchChange()"
            placeholder="Search categories..."
            class="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      <!-- Categories Grid -->
      <div class="flex-1 overflow-y-auto p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <div
            *ngFor="let category of filteredCategories(); trackBy: trackByCategoryId"
            class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
          >
            <!-- Category Header -->
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-3">
                <div [class]="'w-12 h-12 rounded-lg flex items-center justify-center ' + category.color">
                  <lucide-icon [img]="tagIcon" class="w-6 h-6 text-white"></lucide-icon>
                </div>
                <div>
                  <h3 class="text-lg font-semibold text-gray-900">{{ category.name }}</h3>
                  <p class="text-sm text-gray-500">{{ getProductCount(category.name) }} products</p>
                </div>
              </div>
              
              <div class="flex items-center gap-1">
                <button
                  (click)="editCategory(category)"
                  class="text-blue-600 hover:text-blue-900 p-1 rounded transition-colors"
                  title="Edit Category"
                >
                  <lucide-icon [img]="editIcon" class="w-4 h-4"></lucide-icon>
                </button>
                <button
                  (click)="deleteCategory(category.id)"
                  class="text-red-600 hover:text-red-900 p-1 rounded transition-colors"
                  title="Delete Category"
                >
                  <lucide-icon [img]="trashIcon" class="w-4 h-4"></lucide-icon>
                </button>
              </div>
            </div>

            <!-- Category Description -->
            <p class="text-gray-600 text-sm mb-4">
              {{ category.description || 'No description provided' }}
            </p>

            <!-- Category Stats -->
            <div class="bg-gray-50 rounded-lg p-3">
              <div class="flex items-center justify-between text-sm">
                <span class="text-gray-600">Products:</span>
                <span class="font-medium text-gray-900">{{ getProductCount(category.name) }}</span>
              </div>
              <div class="flex items-center justify-between text-sm mt-1">
                <span class="text-gray-600">Total Stock:</span>
                <span class="font-medium text-gray-900">{{ getTotalStock(category.name) }}</span>
              </div>
              <div class="flex items-center justify-between text-sm mt-1">
                <span class="text-gray-600">Stock Value:</span>
                <span class="font-medium text-green-600">\${{ getStockValue(category.name) | number:'1.2-2' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="filteredCategories().length === 0" class="text-center py-12">
          <div class="text-6xl mb-4">🏷️</div>
          <h3 class="text-lg font-semibold text-gray-600 mb-2">No categories found</h3>
          <p class="text-gray-500">Create your first category to organize products</p>
        </div>
      </div>
    </div>

    <!-- Add/Edit Category Modal -->
    <div *ngIf="showAddForm() || editingCategory()" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div class="p-6 border-b border-gray-200">
          <h3 class="text-xl font-bold text-gray-900">
            {{ editingCategory() ? 'Edit Category' : 'Add New Category' }}
          </h3>
        </div>

        <form (ngSubmit)="saveCategory()" class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Category Name *</label>
            <input
              type="text"
              [(ngModel)]="categoryForm.name"
              name="name"
              required
              class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              [(ngModel)]="categoryForm.description"
              name="description"
              rows="3"
              class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            ></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Color *</label>
            <div class="grid grid-cols-6 gap-2">
              <button
                *ngFor="let color of colorOptions"
                type="button"
                (click)="categoryForm.color = color.class"
                [class]="'w-10 h-10 rounded-lg transition-all duration-200 ' + color.class + 
                         (categoryForm.color === color.class ? ' ring-2 ring-offset-2 ring-gray-400' : '')"
                [title]="color.name"
              >
                <lucide-icon [img]="tagIcon" class="w-5 h-5 text-white mx-auto"></lucide-icon>
              </button>
            </div>
          </div>

          <!-- Preview -->
          <div class="bg-gray-50 rounded-lg p-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Preview</label>
            <div class="flex items-center gap-3">
              <div [class]="'w-10 h-10 rounded-lg flex items-center justify-center ' + categoryForm.color">
                <lucide-icon [img]="tagIcon" class="w-5 h-5 text-white"></lucide-icon>
              </div>
              <div>
                <div class="font-medium text-gray-900">{{ categoryForm.name || 'Category Name' }}</div>
                <div class="text-sm text-gray-500">{{ categoryForm.description || 'Category description' }}</div>
              </div>
            </div>
          </div>

          <div class="flex gap-3 pt-4">
            <button
              type="submit"
              class="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors duration-200"
            >
              {{ editingCategory() ? 'Update Category' : 'Add Category' }}
            </button>
            <button
              type="button"
              (click)="cancelForm()"
              class="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 px-4 rounded-lg font-semibold transition-colors duration-200"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class CategoryManagementComponent {
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
    color: 'bg-blue-500'
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
    { name: 'Rose', class: 'bg-rose-500' }
  ];

  constructor(public inventoryService: InventoryService) {}

  filteredCategories = computed(() => {
    let categories = this.inventoryService.allCategories();

    const query = this.searchQuery().toLowerCase().trim();
    if (query) {
      categories = categories.filter(c =>
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
    return this.inventoryService.getProductsByCategory(categoryName)
      .reduce((total, product) => total + product.stock, 0);
  }

  getStockValue(categoryName: string): number {
    return this.inventoryService.getProductsByCategory(categoryName)
      .reduce((total, product) => total + (product.stock * product.costPrice), 0);
  }

  editCategory(category: Category) {
    this.editingCategory.set(category);
    this.categoryForm = {
      name: category.name,
      description: category.description || '',
      color: category.color
    };
  }

  deleteCategory(id: string) {
    const category = this.inventoryService.allCategories().find(c => c.id === id);
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
      this.inventoryService.updateCategory(this.editingCategory()!.id, {
        name: this.categoryForm.name,
        description: this.categoryForm.description,
        color: this.categoryForm.color
      });
    } else {
      // Add new category
      this.inventoryService.addCategory({
        name: this.categoryForm.name,
        description: this.categoryForm.description,
        color: this.categoryForm.color
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
      color: 'bg-blue-500'
    };
  }

  trackByCategoryId(index: number, category: Category): string {
    return category.id;
  }
}