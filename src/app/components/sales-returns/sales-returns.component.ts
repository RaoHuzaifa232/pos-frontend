import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Plus, Search, RotateCcw, Calendar, DollarSign, Edit, Trash2, Check, X, Clock } from 'lucide-angular';
import { InventoryService } from '../../services/inventory.service';
import { SalesReturn } from '../../models/product.model';

@Component({
  selector: 'app-sales-returns',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="h-full flex flex-col">
      <!-- Header -->
      <div class="p-6 border-b border-gray-200 bg-white">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h2 class="text-2xl font-bold text-gray-900">Sales Returns</h2>
            <p class="text-gray-600">Manage customer returns and refunds</p>
          </div>
          <button
            (click)="showAddForm.set(true)"
            class="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
          >
            <lucide-icon [img]="plusIcon" class="w-5 h-5"></lucide-icon>
            Process Return
          </button>
        </div>

        <!-- Search and Filters -->
        <div class="flex gap-4">
          <div class="flex-1 relative">
            <lucide-icon [img]="searchIcon" class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"></lucide-icon>
            <input
              type="text"
              [(ngModel)]="searchQuery"
              (input)="onSearchChange()"
              placeholder="Search returns..."
              class="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          
          <select
            [(ngModel)]="statusFilter"
            (change)="onStatusFilterChange()"
            class="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <!-- Returns List -->
      <div class="flex-1 overflow-y-auto p-6">
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr *ngFor="let return of filteredReturns(); trackBy: trackByReturnId" class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                        <lucide-icon [img]="returnIcon" class="w-5 h-5 text-orange-600"></lucide-icon>
                      </div>
                      <div>
                        <div class="text-sm font-medium text-gray-900">{{ return.productName }}</div>
                        <div class="text-sm text-gray-500">Order: {{ return.orderId }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ return.customerName || 'N/A' }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {{ return.quantity }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-orange-600">
                    \${{ return.totalAmount | number:'1.2-2' }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ return.reason }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center text-sm text-gray-500">
                      <lucide-icon [img]="calendarIcon" class="w-4 h-4 mr-1"></lucide-icon>
                      {{ return.returnDate | date:'short' }}
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span [class]="'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ' + getStatusClass(return.status)">
                      <lucide-icon [img]="getStatusIcon(return.status)" class="w-3 h-3 mr-1"></lucide-icon>
                      {{ return.status | titlecase }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div class="flex items-center gap-2">
                      <button
                        *ngIf="return.status === 'pending'"
                        (click)="approveReturn(return.id)"
                        class="text-green-600 hover:text-green-900 p-1 rounded transition-colors"
                        title="Approve Return"
                      >
                        <lucide-icon [img]="checkIcon" class="w-4 h-4"></lucide-icon>
                      </button>
                      <button
                        *ngIf="return.status === 'pending'"
                        (click)="rejectReturn(return.id)"
                        class="text-red-600 hover:text-red-900 p-1 rounded transition-colors"
                        title="Reject Return"
                      >
                        <lucide-icon [img]="xIcon" class="w-4 h-4"></lucide-icon>
                      </button>
                      <button
                        (click)="editReturn(return)"
                        class="text-blue-600 hover:text-blue-900 p-1 rounded transition-colors"
                        title="Edit Return"
                      >
                        <lucide-icon [img]="editIcon" class="w-4 h-4"></lucide-icon>
                      </button>
                      <button
                        (click)="deleteReturn(return.id)"
                        class="text-red-600 hover:text-red-900 p-1 rounded transition-colors"
                        title="Delete Return"
                      >
                        <lucide-icon [img]="trashIcon" class="w-4 h-4"></lucide-icon>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Empty State -->
          <div *ngIf="filteredReturns().length === 0" class="text-center py-12">
            <div class="text-6xl mb-4">🔄</div>
            <h3 class="text-lg font-semibold text-gray-600 mb-2">No returns found</h3>
            <p class="text-gray-500">No sales returns match your current filters</p>
          </div>
        </div>

        <!-- Summary Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">Total Returns</p>
                <p class="text-2xl font-bold text-gray-900">{{ inventoryService.allSalesReturns().length }}</p>
              </div>
              <div class="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <lucide-icon [img]="returnIcon" class="w-5 h-5 text-orange-600"></lucide-icon>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">Pending</p>
                <p class="text-2xl font-bold text-yellow-600">{{ getPendingReturns() }}</p>
              </div>
              <div class="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <lucide-icon [img]="clockIcon" class="w-5 h-5 text-yellow-600"></lucide-icon>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">Approved</p>
                <p class="text-2xl font-bold text-green-600">{{ getApprovedReturns() }}</p>
              </div>
              <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <lucide-icon [img]="checkIcon" class="w-5 h-5 text-green-600"></lucide-icon>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">Total Amount</p>
                <p class="text-2xl font-bold text-gray-900">\${{ getTotalReturnAmount() | number:'1.2-2' }}</p>
              </div>
              <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <lucide-icon [img]="dollarIcon" class="w-5 h-5 text-blue-600"></lucide-icon>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Return Modal -->
    <div *ngIf="showAddForm() || editingReturn()" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b border-gray-200">
          <h3 class="text-xl font-bold text-gray-900">
            {{ editingReturn() ? 'Edit Sales Return' : 'Process Sales Return' }}
          </h3>
        </div>

        <form (ngSubmit)="saveReturn()" class="p-6 space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Product *</label>
              <select
                [(ngModel)]="returnForm.productId"
                name="productId"
                (change)="onProductSelect()"
                required
                class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">Select Product</option>
                <option *ngFor="let product of inventoryService.allProducts()" [value]="product.id">
                  {{ product.name }} ({{ product.category }})
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Order ID *</label>
              <input
                type="text"
                [(ngModel)]="returnForm.orderId"
                name="orderId"
                required
                class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
              <input
                type="text"
                [(ngModel)]="returnForm.customerName"
                name="customerName"
                class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
              <input
                type="number"
                [(ngModel)]="returnForm.quantity"
                name="quantity"
                (input)="calculateTotal()"
                min="1"
                required
                class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Unit Price *</label>
              <input
                type="number"
                [(ngModel)]="returnForm.unitPrice"
                name="unitPrice"
                (input)="calculateTotal()"
                step="0.01"
                min="0"
                required
                class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Return Date *</label>
              <input
                type="date"
                [(ngModel)]="returnForm.returnDate"
                name="returnDate"
                required
                class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Return Reason *</label>
              <select
                [(ngModel)]="returnForm.reason"
                name="reason"
                required
                class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">Select Reason</option>
                <option value="Defective Product">Defective Product</option>
                <option value="Wrong Item">Wrong Item</option>
                <option value="Customer Changed Mind">Customer Changed Mind</option>
                <option value="Damaged in Transit">Damaged in Transit</option>
                <option value="Not as Described">Not as Described</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Status *</label>
              <select
                [(ngModel)]="returnForm.status"
                name="status"
                required
                class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              [(ngModel)]="returnForm.notes"
              name="notes"
              rows="3"
              class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            ></textarea>
          </div>

          <!-- Total Amount Display -->
          <div class="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div class="flex justify-between items-center">
              <span class="text-lg font-medium text-gray-900">Total Return Amount:</span>
              <span class="text-2xl font-bold text-orange-600">
                \${{ (returnForm.quantity * returnForm.unitPrice) | number:'1.2-2' }}
              </span>
            </div>
          </div>

          <div class="flex gap-3 pt-4">
            <button
              type="submit"
              class="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors duration-200"
            >
              {{ editingReturn() ? 'Update Return' : 'Process Return' }}
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
export class SalesReturnsComponent {
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
    notes: ''
  };

  constructor(public inventoryService: InventoryService) {}

  filteredReturns = computed(() => {
    let returns = this.inventoryService.allSalesReturns();

    const query = this.searchQuery().toLowerCase().trim();
    if (query) {
      returns = returns.filter(r =>
        r.productName.toLowerCase().includes(query) ||
        r.customerName?.toLowerCase().includes(query) ||
        r.orderId.toLowerCase().includes(query) ||
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
      this.returnForm.unitPrice = product.sellingPrice;
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
    if (confirm('Are you sure you want to approve this return? This will add the items back to stock.')) {
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
      notes: salesReturn.notes || ''
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
        notes: this.returnForm.notes || undefined
      };

      this.inventoryService.updateSalesReturn(this.editingReturn()!.id, updates);
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
        notes: this.returnForm.notes || undefined
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
      notes: ''
    };
  }

  getPendingReturns(): number {
    return this.inventoryService.allSalesReturns().filter(r => r.status === 'pending').length;
  }

  getApprovedReturns(): number {
    return this.inventoryService.allSalesReturns().filter(r => r.status === 'approved').length;
  }

  getTotalReturnAmount(): number {
    return this.inventoryService.allSalesReturns()
      .filter(r => r.status === 'approved')
      .reduce((total, r) => total + r.totalAmount, 0);
  }

  trackByReturnId(index: number, salesReturn: SalesReturn): string {
    return salesReturn.id;
  }
}