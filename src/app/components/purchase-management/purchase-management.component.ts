import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Plus, Search, ShoppingCart, Calendar, DollarSign, Edit, Trash2 } from 'lucide-angular';
import { InventoryService } from '../../services/inventory.service';
import { Purchase } from '../../models/product.model';

@Component({
  selector: 'app-purchase-management',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="h-full flex flex-col">
      <!-- Header -->
      <div class="p-6 border-b border-gray-200 bg-white">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h2 class="text-2xl font-bold text-gray-900">Purchase Management</h2>
            <p class="text-gray-600">Record and track your inventory purchases</p>
          </div>
          <button
            (click)="showAddForm.set(true)"
            class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
          >
            <lucide-icon [img]="plusIcon" class="w-5 h-5"></lucide-icon>
            Record Purchase
          </button>
        </div>

        <!-- Search and Bulk Actions -->
        <div class="flex gap-4">
          <div class="flex-1 relative">
            <lucide-icon [img]="searchIcon" class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"></lucide-icon>
            <input
              type="text"
              [(ngModel)]="searchQuery"
              (input)="onSearchChange()"
              placeholder="Search purchases..."
              class="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          
          <div *ngIf="selectedPurchases().length > 0" class="flex gap-2">
            <button
              (click)="bulkDeletePurchases()"
              class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
            >
              <lucide-icon [img]="trashIcon" class="w-4 h-4"></lucide-icon>
              Delete Selected ({{ selectedPurchases().length }})
            </button>
          </div>
        </div>
      </div>

      <!-- Purchases List -->
      <div class="flex-1 overflow-y-auto p-6">
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      [checked]="isAllSelected()"
                      (change)="toggleSelectAll()"
                      class="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost Price</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Cost</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr *ngFor="let purchase of filteredPurchases(); trackBy: trackByPurchaseId" 
                    class="hover:bg-gray-50 transition-colors duration-200">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      [checked]="selectedPurchases().includes(purchase.id)"
                      (change)="togglePurchaseSelection(purchase.id)"
                      class="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                        <lucide-icon [img]="shoppingCartIcon" class="w-5 h-5 text-green-600"></lucide-icon>
                      </div>
                      <div>
                        <div class="text-sm font-medium text-gray-900">{{ purchase.productName }}</div>
                        <div class="text-sm text-gray-500">ID: {{ purchase.productId }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {{ purchase.supplier }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {{ purchase.quantity }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    \${{ purchase.costPrice | number:'1.2-2' }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">
                    \${{ purchase.totalCost | number:'1.2-2' }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center text-sm text-gray-500">
                      <lucide-icon [img]="calendarIcon" class="w-4 h-4 mr-1"></lucide-icon>
                      {{ purchase.purchaseDate | date:'short' }}
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ purchase.invoiceNumber || 'N/A' }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div class="flex items-center gap-2">
                      <button
                        (click)="editPurchase(purchase)"
                        class="text-blue-600 hover:text-blue-900 p-1 rounded transition-colors"
                        title="Edit Purchase"
                      >
                        <lucide-icon [img]="editIcon" class="w-4 h-4"></lucide-icon>
                      </button>
                      <button
                        (click)="deletePurchase(purchase.id)"
                        class="text-red-600 hover:text-red-900 p-1 rounded transition-colors"
                        title="Delete Purchase"
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
          <div *ngIf="filteredPurchases().length === 0" class="text-center py-12">
            <div class="text-6xl mb-4">🛒</div>
            <h3 class="text-lg font-semibold text-gray-600 mb-2">
              {{ searchQuery() ? 'No purchases found' : 'No purchases recorded' }}
            </h3>
            <p class="text-gray-500">
              {{ searchQuery() ? 'Try adjusting your search terms' : 'Start by recording your first purchase' }}
            </p>
          </div>
        </div>

        <!-- Summary Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">Total Purchases</p>
                <p class="text-2xl font-bold text-gray-900">{{ inventoryService.allPurchases().length }}</p>
              </div>
              <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <lucide-icon [img]="shoppingCartIcon" class="w-5 h-5 text-green-600"></lucide-icon>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">Total Amount</p>
                <p class="text-2xl font-bold text-gray-900">\${{ getTotalPurchaseAmount() | number:'1.2-2' }}</p>
              </div>
              <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <lucide-icon [img]="dollarIcon" class="w-5 h-5 text-blue-600"></lucide-icon>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">This Month</p>
                <p class="text-2xl font-bold text-gray-900">\${{ getThisMonthPurchases() | number:'1.2-2' }}</p>
              </div>
              <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <lucide-icon [img]="calendarIcon" class="w-5 h-5 text-purple-600"></lucide-icon>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Purchase Modal -->
    <div *ngIf="showAddForm() || editingPurchase()" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b border-gray-200">
          <h3 class="text-xl font-bold text-gray-900">
            {{ editingPurchase() ? 'Edit Purchase' : 'Record New Purchase' }}
          </h3>
        </div>

        <form (ngSubmit)="savePurchase()" class="p-6 space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Product *</label>
              <select
                [(ngModel)]="purchaseForm.productId"
                name="productId"
                (change)="onProductSelect()"
                [disabled]="editingPurchase() !== null"
                required
                [class]="'w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ' + 
                         (editingPurchase() ? 'bg-gray-50 cursor-not-allowed' : '')"
              >
                <option value="">Select Product</option>
                <option *ngFor="let product of inventoryService.allProducts()" [value]="product.id">
                  {{ product.name }} ({{ product.category }})
                </option>
              </select>
              <p *ngIf="editingPurchase()" class="text-xs text-gray-500 mt-1">
                Product cannot be changed when editing a purchase
              </p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Supplier *</label>
              <select
                [(ngModel)]="purchaseForm.supplier"
                name="supplier"
                required
                class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Select Supplier</option>
                <option *ngFor="let supplier of inventoryService.allSuppliers()" [value]="supplier.name">
                  {{ supplier.name }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
              <input
                type="number"
                [(ngModel)]="purchaseForm.quantity"
                name="quantity"
                (input)="calculateTotal()"
                min="1"
                required
                class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Cost Price per Unit *</label>
              <input
                type="number"
                [(ngModel)]="purchaseForm.costPrice"
                name="costPrice"
                (input)="calculateTotal()"
                step="0.01"
                min="0"
                required
                class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Purchase Date *</label>
              <input
                type="date"
                [(ngModel)]="purchaseForm.purchaseDate"
                name="purchaseDate"
                required
                class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Invoice Number</label>
              <input
                type="text"
                [(ngModel)]="purchaseForm.invoiceNumber"
                name="invoiceNumber"
                class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              [(ngModel)]="purchaseForm.notes"
              name="notes"
              rows="3"
              class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            ></textarea>
          </div>

          <!-- Total Cost Display -->
          <div class="bg-green-50 border border-green-200 rounded-lg p-4">
            <div class="flex justify-between items-center">
              <span class="text-lg font-medium text-gray-900">Total Cost:</span>
              <span class="text-2xl font-bold text-green-600">
                \${{ (purchaseForm.quantity * purchaseForm.costPrice) | number:'1.2-2' }}
              </span>
            </div>
          </div>

          <div class="flex gap-3 pt-4">
            <button
              type="submit"
              class="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors duration-200"
            >
              {{ editingPurchase() ? 'Update Purchase' : 'Record Purchase' }}
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
export class PurchaseManagementComponent {
  readonly plusIcon = Plus;
  readonly searchIcon = Search;
  readonly shoppingCartIcon = ShoppingCart;
  readonly calendarIcon = Calendar;
  readonly dollarIcon = DollarSign;
  readonly editIcon = Edit;
  readonly trashIcon = Trash2;

  searchQuery = signal('');
  showAddForm = signal(false);
  editingPurchase = signal<Purchase | null>(null);
  selectedPurchases = signal<string[]>([]);

  purchaseForm = {
    productId: '',
    productName: '',
    supplier: '',
    quantity: 1,
    costPrice: 0,
    purchaseDate: new Date().toISOString().split('T')[0],
    invoiceNumber: '',
    notes: ''
  };

  constructor(public inventoryService: InventoryService) {}

  filteredPurchases = computed(() => {
    let purchases = this.inventoryService.allPurchases();

    const query = this.searchQuery().toLowerCase().trim();
    if (query) {
      purchases = purchases.filter(p =>
        p.productName.toLowerCase().includes(query) ||
        p.supplier.toLowerCase().includes(query) ||
        p.invoiceNumber?.toLowerCase().includes(query)
      );
    }

    return purchases.sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime());
  });

  onSearchChange() {
    // Trigger reactivity
  }

  onProductSelect() {
    const product = this.inventoryService.allProducts().find(p => p.id === this.purchaseForm.productId);
    if (product) {
      this.purchaseForm.productName = product.name;
      this.purchaseForm.costPrice = product.costPrice;
    }
  }

  calculateTotal() {
    // This is handled by the template binding
  }

  editPurchase(purchase: Purchase) {
    this.editingPurchase.set(purchase);
    this.purchaseForm = {
      productId: purchase.productId,
      productName: purchase.productName,
      supplier: purchase.supplier,
      quantity: purchase.quantity,
      costPrice: purchase.costPrice,
      purchaseDate: purchase.purchaseDate.toISOString().split('T')[0],
      invoiceNumber: purchase.invoiceNumber || '',
      notes: purchase.notes || ''
    };
  }

  deletePurchase(id: string) {
    if (confirm('Are you sure you want to delete this purchase? This will also adjust the stock levels.')) {
      this.inventoryService.deletePurchase(id);
    }
  }

  savePurchase() {
    if (this.editingPurchase()) {
      // Update existing purchase
      const updates: Partial<Purchase> = {
        productId: this.purchaseForm.productId,
        productName: this.purchaseForm.productName,
        supplier: this.purchaseForm.supplier,
        quantity: this.purchaseForm.quantity,
        costPrice: this.purchaseForm.costPrice,
        totalCost: this.purchaseForm.quantity * this.purchaseForm.costPrice,
        purchaseDate: new Date(this.purchaseForm.purchaseDate),
        invoiceNumber: this.purchaseForm.invoiceNumber || undefined,
        notes: this.purchaseForm.notes || undefined
      };

      this.inventoryService.updatePurchase(this.editingPurchase()!.id, updates);
    } else {
      // Add new purchase
      const purchase: Omit<Purchase, 'id'> = {
        productId: this.purchaseForm.productId,
        productName: this.purchaseForm.productName,
        supplier: this.purchaseForm.supplier,
        quantity: this.purchaseForm.quantity,
        costPrice: this.purchaseForm.costPrice,
        totalCost: this.purchaseForm.quantity * this.purchaseForm.costPrice,
        purchaseDate: new Date(this.purchaseForm.purchaseDate),
        invoiceNumber: this.purchaseForm.invoiceNumber || undefined,
        notes: this.purchaseForm.notes || undefined
      };

      this.inventoryService.addPurchase(purchase);
    }

    this.cancelForm();
  }

  cancelForm() {
    this.showAddForm.set(false);
    this.editingPurchase.set(null);
    this.purchaseForm = {
      productId: '',
      productName: '',
      supplier: '',
      quantity: 1,
      costPrice: 0,
      purchaseDate: new Date().toISOString().split('T')[0],
      invoiceNumber: '',
      notes: ''
    };
  }

  getTotalPurchaseAmount(): number {
    return this.inventoryService.allPurchases().reduce((total, purchase) => total + purchase.totalCost, 0);
  }

  getThisMonthPurchases(): number {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    return this.inventoryService.allPurchases()
      .filter(purchase => {
        const purchaseDate = new Date(purchase.purchaseDate);
        return purchaseDate.getMonth() === thisMonth && purchaseDate.getFullYear() === thisYear;
      })
      .reduce((total, purchase) => total + purchase.totalCost, 0);
  }

  togglePurchaseSelection(purchaseId: string) {
    const currentSelected = this.selectedPurchases();
    if (currentSelected.includes(purchaseId)) {
      this.selectedPurchases.set(currentSelected.filter(id => id !== purchaseId));
    } else {
      this.selectedPurchases.set([...currentSelected, purchaseId]);
    }
  }

  isAllSelected(): boolean {
    const filtered = this.filteredPurchases();
    const selected = this.selectedPurchases();
    return filtered.length > 0 && filtered.every(p => selected.includes(p.id));
  }

  toggleSelectAll() {
    const filtered = this.filteredPurchases();
    if (this.isAllSelected()) {
      // Deselect all
      const currentSelected = this.selectedPurchases();
      const filteredIds = filtered.map(p => p.id);
      this.selectedPurchases.set(currentSelected.filter(id => !filteredIds.includes(id)));
    } else {
      // Select all
      const currentSelected = this.selectedPurchases();
      const filteredIds = filtered.map(p => p.id);
      const newSelected = [...new Set([...currentSelected, ...filteredIds])];
      this.selectedPurchases.set(newSelected);
    }
  }

  bulkDeletePurchases() {
    const selectedCount = this.selectedPurchases().length;
    if (confirm(`Are you sure you want to delete ${selectedCount} purchase(s)? This will also adjust the stock levels accordingly.`)) {
      this.selectedPurchases().forEach(id => {
        this.inventoryService.deletePurchase(id);
      });
      this.selectedPurchases.set([]);
    }
  }

  trackByPurchaseId(index: number, purchase: Purchase): string {
    return purchase.id;
  }
}