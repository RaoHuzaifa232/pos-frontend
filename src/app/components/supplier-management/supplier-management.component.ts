import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Plus, Search, Edit, Trash2, Users, Phone, Mail, MapPin, Package } from 'lucide-angular';
import { InventoryService } from '../../services/inventory.service';
import { Supplier } from '../../models/product.model';

@Component({
  selector: 'app-supplier-management',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="h-full flex flex-col">
      <!-- Header -->
      <div class="p-6 border-b border-gray-200 bg-white">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h2 class="text-2xl font-bold text-gray-900">Supplier Management</h2>
            <p class="text-gray-600">Manage your supplier relationships</p>
          </div>
          <button
            (click)="showAddForm.set(true)"
            class="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
          >
            <lucide-icon [img]="plusIcon" class="w-5 h-5"></lucide-icon>
            Add Supplier
          </button>
        </div>

        <!-- Search -->
        <div class="relative">
          <lucide-icon [img]="searchIcon" class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"></lucide-icon>
          <input
            type="text"
            [(ngModel)]="searchQuery"
            (input)="onSearchChange()"
            placeholder="Search suppliers..."
            class="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>
      </div>

      <!-- Suppliers Grid -->
      <div class="flex-1 overflow-y-auto p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            *ngFor="let supplier of filteredSuppliers(); trackBy: trackBySupplierId"
            class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
          >
            <!-- Supplier Header -->
            <div class="flex items-start justify-between mb-4">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                  <lucide-icon [img]="usersIcon" class="w-6 h-6 text-teal-600"></lucide-icon>
                </div>
                <div>
                  <h3 class="text-lg font-semibold text-gray-900">{{ supplier.name }}</h3>
                  <p class="text-sm text-gray-500">{{ supplier.contact }}</p>
                </div>
              </div>
              
              <div class="flex items-center gap-1">
                <button
                  (click)="editSupplier(supplier)"
                  class="text-blue-600 hover:text-blue-900 p-1 rounded transition-colors"
                  title="Edit Supplier"
                >
                  <lucide-icon [img]="editIcon" class="w-4 h-4"></lucide-icon>
                </button>
                <button
                  (click)="deleteSupplier(supplier.id)"
                  class="text-red-600 hover:text-red-900 p-1 rounded transition-colors"
                  title="Delete Supplier"
                >
                  <lucide-icon [img]="trashIcon" class="w-4 h-4"></lucide-icon>
                </button>
              </div>
            </div>

            <!-- Contact Information -->
            <div class="space-y-2 mb-4">
              <div *ngIf="supplier.email" class="flex items-center gap-2 text-sm text-gray-600">
                <lucide-icon [img]="mailIcon" class="w-4 h-4"></lucide-icon>
                <span>{{ supplier.email }}</span>
              </div>
              <div *ngIf="supplier.phone" class="flex items-center gap-2 text-sm text-gray-600">
                <lucide-icon [img]="phoneIcon" class="w-4 h-4"></lucide-icon>
                <span>{{ supplier.phone }}</span>
              </div>
              <div *ngIf="supplier.address" class="flex items-start gap-2 text-sm text-gray-600">
                <lucide-icon [img]="mapPinIcon" class="w-4 h-4 mt-0.5"></lucide-icon>
                <span>{{ supplier.address }}</span>
              </div>
            </div>

            <!-- Supplier Stats -->
            <div class="bg-gray-50 rounded-lg p-3">
              <div class="flex items-center justify-between text-sm">
                <span class="text-gray-600">Products Supplied:</span>
                <span class="font-medium text-gray-900">{{ getProductCount(supplier.name) }}</span>
              </div>
              <div class="flex items-center justify-between text-sm mt-1">
                <span class="text-gray-600">Total Purchases:</span>
                <span class="font-medium text-gray-900">{{ getPurchaseCount(supplier.name) }}</span>
              </div>
              <div class="flex items-center justify-between text-sm mt-1">
                <span class="text-gray-600">Purchase Value:</span>
                <span class="font-medium text-green-600">\${{ getPurchaseValue(supplier.name) | number:'1.2-2' }}</span>
              </div>
            </div>

            <!-- Quick Actions -->
            <div class="mt-4 pt-4 border-t border-gray-200">
              <div class="flex gap-2">
                <button
                  (click)="viewProducts(supplier.name)"
                  class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-1"
                >
                  <lucide-icon [img]="packageIcon" class="w-4 h-4"></lucide-icon>
                  Products
                </button>
                <button
                  *ngIf="supplier.email"
                  (click)="contactSupplier(supplier.email!)"
                  class="flex-1 bg-teal-100 hover:bg-teal-200 text-teal-700 py-2 px-3 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-1"
                >
                  <lucide-icon [img]="mailIcon" class="w-4 h-4"></lucide-icon>
                  Contact
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="filteredSuppliers().length === 0" class="text-center py-12">
          <div class="text-6xl mb-4">👥</div>
          <h3 class="text-lg font-semibold text-gray-600 mb-2">No suppliers found</h3>
          <p class="text-gray-500">Add your first supplier to start managing relationships</p>
        </div>
      </div>
    </div>

    <!-- Add/Edit Supplier Modal -->
    <div *ngIf="showAddForm() || editingSupplier()" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b border-gray-200">
          <h3 class="text-xl font-bold text-gray-900">
            {{ editingSupplier() ? 'Edit Supplier' : 'Add New Supplier' }}
          </h3>
        </div>

        <form (ngSubmit)="saveSupplier()" class="p-6 space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Supplier Name *</label>
              <input
                type="text"
                [(ngModel)]="supplierForm.name"
                name="name"
                required
                class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Contact Person *</label>
              <input
                type="text"
                [(ngModel)]="supplierForm.contact"
                name="contact"
                required
                class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                [(ngModel)]="supplierForm.email"
                name="email"
                class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                [(ngModel)]="supplierForm.phone"
                name="phone"
                class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <textarea
              [(ngModel)]="supplierForm.address"
              name="address"
              rows="3"
              class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            ></textarea>
          </div>

          <div class="flex gap-3 pt-4">
            <button
              type="submit"
              class="flex-1 bg-teal-600 hover:bg-teal-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors duration-200"
            >
              {{ editingSupplier() ? 'Update Supplier' : 'Add Supplier' }}
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
export class SupplierManagementComponent {
  readonly plusIcon = Plus;
  readonly searchIcon = Search;
  readonly editIcon = Edit;
  readonly trashIcon = Trash2;
  readonly usersIcon = Users;
  readonly phoneIcon = Phone;
  readonly mailIcon = Mail;
  readonly mapPinIcon = MapPin;
  readonly packageIcon = Package;

  searchQuery = signal('');
  showAddForm = signal(false);
  editingSupplier = signal<Supplier | null>(null);

  supplierForm = {
    name: '',
    contact: '',
    email: '',
    phone: '',
    address: ''
  };

  constructor(public inventoryService: InventoryService) {}

  filteredSuppliers = computed(() => {
    let suppliers = this.inventoryService.allSuppliers();

    const query = this.searchQuery().toLowerCase().trim();
    if (query) {
      suppliers = suppliers.filter(s =>
        s.name.toLowerCase().includes(query) ||
        s.contact.toLowerCase().includes(query) ||
        s.email?.toLowerCase().includes(query) ||
        s.phone?.includes(query)
      );
    }

    return suppliers.sort((a, b) => a.name.localeCompare(b.name));
  });

  onSearchChange() {
    // Trigger reactivity
  }

  getProductCount(supplierName: string): number {
    return this.inventoryService.getProductsBySupplier(supplierName).length;
  }

  getPurchaseCount(supplierName: string): number {
    return this.inventoryService.allPurchases().filter(p => p.supplier === supplierName).length;
  }

  getPurchaseValue(supplierName: string): number {
    return this.inventoryService.allPurchases()
      .filter(p => p.supplier === supplierName)
      .reduce((total, p) => total + p.totalCost, 0);
  }

  viewProducts(supplierName: string) {
    // This could navigate to products filtered by supplier
    // For now, just show an alert
    const products = this.getProductCount(supplierName);
    alert(`${supplierName} supplies ${products} product(s). This would navigate to the products view filtered by this supplier.`);
  }

  contactSupplier(email: string) {
    // Open email client
    window.location.href = `mailto:${email}`;
  }

  editSupplier(supplier: Supplier) {
    this.editingSupplier.set(supplier);
    this.supplierForm = {
      name: supplier.name,
      contact: supplier.contact,
      email: supplier.email || '',
      phone: supplier.phone || '',
      address: supplier.address || ''
    };
  }

  deleteSupplier(id: string) {
    const supplier = this.inventoryService.allSuppliers().find(s => s.id === id);
    if (!supplier) return;

    const productCount = this.getProductCount(supplier.name);
    const purchaseCount = this.getPurchaseCount(supplier.name);

    if (productCount > 0 || purchaseCount > 0) {
      alert(`Cannot delete supplier "${supplier.name}" because they have ${productCount} product(s) and ${purchaseCount} purchase(s) associated. Please reassign or remove these first.`);
      return;
    }

    if (confirm(`Are you sure you want to delete the supplier "${supplier.name}"?`)) {
      this.inventoryService.deleteSupplier(id);
    }
  }

  saveSupplier() {
    if (this.editingSupplier()) {
      // Update existing supplier
      this.inventoryService.updateSupplier(this.editingSupplier()!.id, {
        name: this.supplierForm.name,
        contact: this.supplierForm.contact,
        email: this.supplierForm.email || undefined,
        phone: this.supplierForm.phone || undefined,
        address: this.supplierForm.address || undefined
      });
    } else {
      // Add new supplier
      this.inventoryService.addSupplier({
        name: this.supplierForm.name,
        contact: this.supplierForm.contact,
        email: this.supplierForm.email || undefined,
        phone: this.supplierForm.phone || undefined,
        address: this.supplierForm.address || undefined
      });
    }

    this.cancelForm();
  }

  cancelForm() {
    this.showAddForm.set(false);
    this.editingSupplier.set(null);
    this.supplierForm = {
      name: '',
      contact: '',
      email: '',
      phone: '',
      address: ''
    };
  }

  trackBySupplierId(index: number, supplier: Supplier): string {
    return supplier.id;
  }
}