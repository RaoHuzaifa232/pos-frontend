import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Plus, Search, RotateCcw, Calendar, DollarSign, Edit, Trash2, Check, X, Clock } from 'lucide-angular';
import { InventoryService } from '../../services/inventory.service';
import { PurchaseReturn } from '../../models/product.model';

@Component({
  selector: 'app-purchase-returns',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './purchase-returns.html'
})
export class PurchaseReturns {
  readonly plusIcon = Plus;
  readonly searchIcon = Search;
  readonly returnIcon = RotateCcw;
  readonly calendarIcon = Calendar;
  readonly dollarIcon = DollarSign;
  readonly editIcon = Edit;
  readonly trashIcon = Trash2;
  readonly checkIcon = Check;
  readonly xIcon = X;
  readonly clockIcon = Clock;

  searchQuery = signal('');
  statusFilter = signal('');
  showAddForm = signal(false);
  editingReturn = signal<PurchaseReturn | null>(null);

  returnForm = {
    productId: '',
    productName: '',
    purchaseId: '',
    supplier: '',
    quantity: 1,
    unitPrice: 0,
    returnDate: new Date().toISOString().split('T')[0],
    reason: '',
    status: 'pending' as 'pending' | 'approved' | 'rejected',
    notes: ''
  };

  constructor(public inventoryService: InventoryService) {}

  filteredReturns = computed(() => {
    let returns = this.inventoryService.allPurchaseReturns();

    const query = this.searchQuery().toLowerCase().trim();
    if (query) {
      returns = returns.filter(r =>
        r.productName.toLowerCase().includes(query) ||
        r.supplier.toLowerCase().includes(query) ||
        r.purchaseId.toLowerCase().includes(query) ||
        r.reason.toLowerCase().includes(query)
      );
    }

    if (this.statusFilter()) {
      returns = returns.filter(r => r.status === this.statusFilter());
    }

    return returns.sort((a, b) => new Date(b.returnDate).getTime() - new Date(a.returnDate).getTime());
  });

  onSearchChange() {
    // Trigger reactivity
  }

  onStatusFilterChange() {
    // Trigger reactivity
  }

  onProductSelect() {
    const product = this.inventoryService.allProducts().find(p => p.id === this.returnForm.productId);
    if (product) {
      this.returnForm.productName = product.name;
      this.returnForm.unitPrice = product.costPrice;
    }
  }

  calculateTotal() {
    // This is handled by the template binding
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusIcon(status: string) {
    switch (status) {
      case 'pending': return this.clockIcon;
      case 'approved': return this.checkIcon;
      case 'rejected': return this.xIcon;
      default: return this.clockIcon;
    }
  }

  approveReturn(id: string) {
    if (confirm('Are you sure you want to approve this return? This will remove the items from stock.')) {
      this.inventoryService.updatePurchaseReturn(id, { status: 'approved' });
    }
  }

  rejectReturn(id: string) {
    if (confirm('Are you sure you want to reject this return?')) {
      this.inventoryService.updatePurchaseReturn(id, { status: 'rejected' });
    }
  }

  editReturn(purchaseReturn: PurchaseReturn) {
    this.editingReturn.set(purchaseReturn);
    this.returnForm = {
      productId: purchaseReturn.productId,
      productName: purchaseReturn.productName,
      purchaseId: purchaseReturn.purchaseId,
      supplier: purchaseReturn.supplier,
      quantity: purchaseReturn.quantity,
      unitPrice: purchaseReturn.unitPrice,
      returnDate: purchaseReturn.returnDate.toISOString().split('T')[0],
      reason: purchaseReturn.reason,
      status: purchaseReturn.status,
      notes: purchaseReturn.notes || ''
    };
  }

  deleteReturn(id: string) {
    if (confirm('Are you sure you want to delete this return?')) {
      this.inventoryService.deletePurchaseReturn(id);
    }
  }

  saveReturn() {
    if (this.editingReturn()) {
      // Update existing return
      const updates: Partial<PurchaseReturn> = {
        productId: this.returnForm.productId,
        productName: this.returnForm.productName,
        purchaseId: this.returnForm.purchaseId,
        supplier: this.returnForm.supplier,
        quantity: this.returnForm.quantity,
        unitPrice: this.returnForm.unitPrice,
        totalAmount: this.returnForm.quantity * this.returnForm.unitPrice,
        returnDate: new Date(this.returnForm.returnDate),
        reason: this.returnForm.reason,
        status: this.returnForm.status,
        notes: this.returnForm.notes || undefined
      };

      this.inventoryService.updatePurchaseReturn(this.editingReturn()!.id, updates);
    } else {
      // Add new return
      const purchaseReturn: Omit<PurchaseReturn, 'id'> = {
        productId: this.returnForm.productId,
        productName: this.returnForm.productName,
        purchaseId: this.returnForm.purchaseId,
        supplier: this.returnForm.supplier,
        quantity: this.returnForm.quantity,
        unitPrice: this.returnForm.unitPrice,
        totalAmount: this.returnForm.quantity * this.returnForm.unitPrice,
        returnDate: new Date(this.returnForm.returnDate),
        reason: this.returnForm.reason,
        status: this.returnForm.status,
        notes: this.returnForm.notes || undefined
      };

      this.inventoryService.addPurchaseReturn(purchaseReturn);
    }

    this.cancelForm();
  }

  cancelForm() {
    this.showAddForm.set(false);
    this.editingReturn.set(null);
    this.returnForm = {
      productId: '',
      productName: '',
      purchaseId: '',
      supplier: '',
      quantity: 1,
      unitPrice: 0,
      returnDate: new Date().toISOString().split('T')[0],
      reason: '',
      status: 'pending',
      notes: ''
    };
  }

  getPendingReturns(): number {
    return this.inventoryService.allPurchaseReturns().filter(r => r.status === 'pending').length;
  }

  getApprovedReturns(): number {
    return this.inventoryService.allPurchaseReturns().filter(r => r.status === 'approved').length;
  }

  getTotalReturnAmount(): number {
    return this.inventoryService.allPurchaseReturns()
      .filter(r => r.status === 'approved')
      .reduce((total, r) => total + r.totalAmount, 0);
  }

  trackByReturnId(index: number, purchaseReturn: PurchaseReturn): string {
    return purchaseReturn.id;
  }
}