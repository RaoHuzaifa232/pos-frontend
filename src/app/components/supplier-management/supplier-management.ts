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
  templateUrl: './supplier-management.html'
})
export class SupplierManagement {
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