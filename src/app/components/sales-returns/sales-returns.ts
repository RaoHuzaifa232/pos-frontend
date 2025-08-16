import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  Calendar,
  Check,
  Clock,
  DollarSign,
  SquarePen,
  LucideAngularModule,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  X,
} from 'lucide-angular';
import { SalesReturn } from '../../models/product.model';
import { InventoryService } from '../../services/inventory.service';

@Component({
  selector: 'app-sales-returns',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './sales-returns.html',
})
export class SalesReturns {
  readonly plusIcon = Plus;
  readonly searchIcon = Search;
  readonly returnIcon = RotateCcw;
  readonly calendarIcon = Calendar;
  readonly dollarIcon = DollarSign;
  readonly editIcon = SquarePen;
  readonly trashIcon = Trash2;
  readonly checkIcon = Check;
  readonly xIcon = X;
  readonly clockIcon = Clock;

  searchQuery = signal('');
  statusFilter = signal('');
  showAddForm = signal(false);
  editingReturn = signal<SalesReturn | null>(null);

  returnForm = {
    productId: '',
    productName: '',
    orderId: '',
    customerName: '',
    quantity: 1,
    unitPrice: 0,
    returnDate: new Date().toISOString().split('T')[0],
    reason: '',
    status: 'pending' as 'pending' | 'approved' | 'rejected',
    notes: '',
  };

  constructor(public inventoryService: InventoryService) {}

  filteredReturns = computed(() => {
    let returns = this.inventoryService.allSalesReturns();

    const query = this.searchQuery().toLowerCase().trim();
    if (query) {
      returns = returns.filter(
        (r) =>
          r.productName.toLowerCase().includes(query) ||
          r.customerName?.toLowerCase().includes(query) ||
          r.orderId.toLowerCase().includes(query) ||
          r.reason.toLowerCase().includes(query)
      );
    }

    if (this.statusFilter()) {
      returns = returns.filter((r) => r.status === this.statusFilter());
    }

    return returns.sort(
      (a, b) =>
        new Date(b.returnDate).getTime() - new Date(a.returnDate).getTime()
    );
  });

  onSearchChange() {
    // Trigger reactivity
  }

  onStatusFilterChange() {
    // Trigger reactivity
  }

  onProductSelect() {
    const product = this.inventoryService
      .allProducts()
      .find((p) => p.id === this.returnForm.productId);
    if (product) {
      this.returnForm.productName = product.name;
      this.returnForm.unitPrice = product.sellingPrice;
    }
  }

  calculateTotal() {
    // This is handled by the template binding
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusIcon(status: string) {
    switch (status) {
      case 'pending':
        return this.clockIcon;
      case 'approved':
        return this.checkIcon;
      case 'rejected':
        return this.xIcon;
      default:
        return this.clockIcon;
    }
  }

  approveReturn(id: string) {
    if (
      confirm(
        'Are you sure you want to approve this return? This will add the items back to stock.'
      )
    ) {
      this.inventoryService.updateSalesReturn(id, { status: 'approved' });
    }
  }

  rejectReturn(id: string) {
    if (confirm('Are you sure you want to reject this return?')) {
      this.inventoryService.updateSalesReturn(id, { status: 'rejected' });
    }
  }

  editReturn(salesReturn: SalesReturn) {
    this.editingReturn.set(salesReturn);
    this.returnForm = {
      productId: salesReturn.productId,
      productName: salesReturn.productName,
      orderId: salesReturn.orderId,
      customerName: salesReturn.customerName || '',
      quantity: salesReturn.quantity,
      unitPrice: salesReturn.unitPrice,
      returnDate: salesReturn.returnDate.toISOString().split('T')[0],
      reason: salesReturn.reason,
      status: salesReturn.status,
      notes: salesReturn.notes || '',
    };
  }

  deleteReturn(id: string) {
    if (confirm('Are you sure you want to delete this return?')) {
      this.inventoryService.deleteSalesReturn(id);
    }
  }

  saveReturn() {
    if (this.editingReturn()) {
      // Update existing return
      const updates: Partial<SalesReturn> = {
        productId: this.returnForm.productId,
        productName: this.returnForm.productName,
        orderId: this.returnForm.orderId,
        customerName: this.returnForm.customerName || undefined,
        quantity: this.returnForm.quantity,
        unitPrice: this.returnForm.unitPrice,
        totalAmount: this.returnForm.quantity * this.returnForm.unitPrice,
        returnDate: new Date(this.returnForm.returnDate),
        reason: this.returnForm.reason,
        status: this.returnForm.status,
        notes: this.returnForm.notes || undefined,
      };

      this.inventoryService.updateSalesReturn(
        this.editingReturn()!.id,
        updates
      );
    } else {
      // Add new return
      const salesReturn: Omit<SalesReturn, 'id'> = {
        productId: this.returnForm.productId,
        productName: this.returnForm.productName,
        orderId: this.returnForm.orderId,
        customerName: this.returnForm.customerName || undefined,
        quantity: this.returnForm.quantity,
        unitPrice: this.returnForm.unitPrice,
        totalAmount: this.returnForm.quantity * this.returnForm.unitPrice,
        returnDate: new Date(this.returnForm.returnDate),
        reason: this.returnForm.reason,
        status: this.returnForm.status,
        notes: this.returnForm.notes || undefined,
      };

      this.inventoryService.addSalesReturn(salesReturn);
    }

    this.cancelForm();
  }

  cancelForm() {
    this.showAddForm.set(false);
    this.editingReturn.set(null);
    this.returnForm = {
      productId: '',
      productName: '',
      orderId: '',
      customerName: '',
      quantity: 1,
      unitPrice: 0,
      returnDate: new Date().toISOString().split('T')[0],
      reason: '',
      status: 'pending',
      notes: '',
    };
  }

  getPendingReturns(): number {
    return this.inventoryService
      .allSalesReturns()
      .filter((r) => r.status === 'pending').length;
  }

  getApprovedReturns(): number {
    return this.inventoryService
      .allSalesReturns()
      .filter((r) => r.status === 'approved').length;
  }

  getTotalReturnAmount(): number {
    return this.inventoryService
      .allSalesReturns()
      .filter((r) => r.status === 'approved')
      .reduce((total, r) => total + r.totalAmount, 0);
  }
}
