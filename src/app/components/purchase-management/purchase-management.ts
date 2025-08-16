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
  templateUrl: './purchase-management.html'
})
export class PurchaseManagement {
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