import { computed, inject, Injectable, signal } from '@angular/core';
import {
  Category,
  InventoryReport,
  PaymentMethod,
  Product,
  Purchase,
  PurchaseReturn,
  SalesReturn,
  StockMovement,
  Supplier,
} from '../models/product.model';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class InventoryService {
  private readonly _http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:3000';

  private products = signal<Product[]>([]);
  private purchases = signal<Purchase[]>([]);
  private stockMovements = signal<StockMovement[]>([]);
  private suppliers = signal<Supplier[]>([]);
  private paymentMethods = signal<PaymentMethod[]>([]);
  private categories = signal<Category[]>([]);
  private salesReturns = signal<SalesReturn[]>([]);
  private purchaseReturns = signal<PurchaseReturn[]>([]);

  // Public readonly signals
  readonly allProducts = this.products.asReadonly();
  readonly allPurchases = this.purchases.asReadonly();
  readonly allStockMovements = this.stockMovements.asReadonly();
  readonly allSuppliers = this.suppliers.asReadonly();
  readonly allPaymentMethods = this.paymentMethods.asReadonly();
  readonly allCategories = this.categories.asReadonly();
  readonly allSalesReturns = this.salesReturns.asReadonly();
  readonly allPurchaseReturns = this.purchaseReturns.asReadonly();

  // Computed values
  readonly lowStockProducts = computed(() =>
    this.products().filter((p) => p.stock <= p.minStock)
  );

  readonly outOfStockProducts = computed(() =>
    this.products().filter((p) => p.stock === 0)
  );

  readonly inventoryValue = computed(() =>
    this.products().reduce((total, p) => total + p.stock * p.costPrice, 0)
  );

  constructor() {
    this.initializeData();
  }

  private initializeData() {
    this.getAllCategories();
    this.getAllProducts();

    // Sample suppliers
    const sampleSuppliers: Supplier[] = [
      {
        id: '1',
        name: 'ABC Distributors',
        contact: 'John Doe',
        email: 'john@abc.com',
        phone: '123-456-7890',
      },
      {
        id: '2',
        name: 'XYZ Wholesale',
        contact: 'Jane Smith',
        email: 'jane@xyz.com',
        phone: '098-765-4321',
      },
      {
        id: '3',
        name: 'Tech Supply Co',
        contact: 'Mike Johnson',
        email: 'mike@techsupply.com',
        phone: '555-123-4567',
      },
    ];

    // Sample payment methods
    const samplePaymentMethods: PaymentMethod[] = [
      { id: '1', name: 'Cash', type: 'cash', isActive: true },
      {
        id: '2',
        name: 'Bank Transfer',
        type: 'bank',
        accountNumber: '1234567890',
        isActive: true,
      },
      { id: '3', name: 'Credit Card', type: 'digital', isActive: true },
      { id: '4', name: 'Digital Wallet', type: 'digital', isActive: true },
    ];

    this.suppliers.set(sampleSuppliers);
    this.paymentMethods.set(samplePaymentMethods);
  }

  // Product Management
  addProduct(
    newProduct: Omit<Product, '_id' | 'createdAt' | 'updatedAt'>
  ): void {
    console.log('Product Add', newProduct);
    this._http.post<Product>(`${this.baseUrl}/products`, newProduct).subscribe({
      next: (product: Product) => {
        console.log(product);
        this.products.update((products) => [...products, product]);
        this.addStockMovement(
          product._id,
          product.name,
          'in',
          product.stock,
          'Initial stock'
        );
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  getAllProducts(): void {
    this._http.get<Product[]>(`${this.baseUrl}/products`).subscribe({
      next: (products: Product[]) => {
        console.log(products);
        this.products.set(products);
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  updateProduct(id: string, updates: Partial<Product>): void {
    this._http
      .put<Product>(`${this.baseUrl}/products/${id}`, updates)
      .subscribe({
        next: () => {
          this.getAllProducts();
        },
        error: (error) => {
          console.log(error);
        },
      });
  }

  deleteProduct(id: string): void {
    this._http.delete(`${this.baseUrl}/products/${id}`).subscribe({
      next: () => {
        this.getAllProducts();
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  // Purchase Management
  addPurchase(purchase: Omit<Purchase, 'id'>): void {
    const newPurchase: Purchase = {
      ...purchase,
      id: Date.now().toString(),
    };

    this.purchases.update((purchases) => [...purchases, newPurchase]);

    // Update product stock
    this.updateProductStock(purchase.productId, purchase.quantity, 'in');

    // Add stock movement
    this.addStockMovement(
      purchase.productId,
      purchase.productName,
      'in',
      purchase.quantity,
      `Purchase from ${purchase.supplier}`,
      newPurchase.id
    );
  }

  updatePurchase(id: string, updates: Partial<Purchase>): void {
    const currentPurchases = this.purchases();
    const existingPurchase = currentPurchases.find((p) => p.id === id);

    if (!existingPurchase) return;

    // If quantity changed, adjust stock accordingly
    if (
      updates.quantity !== undefined &&
      updates.quantity !== existingPurchase.quantity
    ) {
      const quantityDifference = updates.quantity - existingPurchase.quantity;
      this.updateProductStock(
        existingPurchase.productId,
        Math.abs(quantityDifference),
        quantityDifference > 0 ? 'in' : 'out'
      );

      // Add stock movement for the adjustment
      this.addStockMovement(
        existingPurchase.productId,
        existingPurchase.productName,
        quantityDifference > 0 ? 'in' : 'out',
        Math.abs(quantityDifference),
        `Purchase adjustment - ${existingPurchase.supplier}`,
        id
      );
    }

    // Update the purchase
    this.purchases.update((purchases) =>
      purchases.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  }

  deletePurchase(id: string): void {
    const currentPurchases = this.purchases();
    const purchaseToDelete = currentPurchases.find((p) => p.id === id);

    if (!purchaseToDelete) return;

    // Reverse the stock increase from this purchase
    this.updateProductStock(
      purchaseToDelete.productId,
      purchaseToDelete.quantity,
      'out'
    );

    // Add stock movement for the reversal
    this.addStockMovement(
      purchaseToDelete.productId,
      purchaseToDelete.productName,
      'out',
      purchaseToDelete.quantity,
      `Purchase deleted - ${purchaseToDelete.supplier}`,
      id
    );

    // Remove the purchase
    this.purchases.update((purchases) => purchases.filter((p) => p.id !== id));
  }

  // Stock Management
  updateProductStock(
    productId: string,
    quantity: number,
    type: 'in' | 'out'
  ): void {
    this.products.update((products) =>
      products.map((p) => {
        if (p._id === productId) {
          const newStock =
            type === 'in' ? p.stock + quantity : p.stock - quantity;
          return { ...p, stock: Math.max(0, newStock), updatedAt: new Date() };
        }
        return p;
      })
    );
  }

  adjustStock(productId: string, newStock: number, reason: string): void {
    const product = this.products().find((p) => p._id === productId);
    if (!product) return;

    const difference = newStock - product.stock;
    this.products.update((products) =>
      products.map((p) =>
        p._id === productId
          ? { ...p, stock: newStock, updatedAt: new Date() }
          : p
      )
    );

    this.addStockMovement(
      productId,
      product.name,
      'adjustment',
      Math.abs(difference),
      reason
    );
  }

  addStockMovement(
    productId: string,
    productName: string,
    type: 'in' | 'out' | 'adjustment',
    quantity: number,
    reason: string,
    reference?: string
  ): void {
    const movement: StockMovement = {
      id: Date.now().toString(),
      productId,
      productName,
      type,
      quantity,
      reason,
      timestamp: new Date(),
      reference,
    };

    this.stockMovements.update((movements) => [movement, ...movements]);
  }

  // Supplier Management
  addSupplier(supplier: Omit<Supplier, 'id'>): void {
    const newSupplier: Supplier = {
      ...supplier,
      id: Date.now().toString(),
    };
    this.suppliers.update((suppliers) => [...suppliers, newSupplier]);
  }

  updateSupplier(id: string, updates: Partial<Supplier>): void {
    this.suppliers.update((suppliers) =>
      suppliers.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  }

  deleteSupplier(id: string): void {
    this.suppliers.update((suppliers) => suppliers.filter((s) => s.id !== id));
  }

  // Category Management
  addCategory(category: Omit<Category, '_id'>): void {
    this._http
      .post<Category>(`${this.baseUrl}/categories`, category)
      .subscribe({
        next: (category: Category) => {
          console.log(category);
          this.categories.update((categories) => [...categories, category]);
        },
        error: (error) => {
          console.log(error);
        },
      });
  }

  getAllCategories(): void {
    this._http.get<Category[]>(`${this.baseUrl}/categories`).subscribe({
      next: (categories: Category[]) => {
        console.log(categories);
        this.categories.set(categories);
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  updateCategory(id: string, updates: Partial<Category>): void {
    this._http
      .put<Category>(`${this.baseUrl}/categories/${id}`, updates)
      .subscribe({
        next: () => {
          this.getAllCategories();
        },
        error: (error) => {
          console.log(error);
        },
      });
  }

  deleteCategory(id: string): void {
    this._http.delete(`${this.baseUrl}/categories/${id}`).subscribe({
      next: () => {
        this.getAllCategories();
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  // Reports and Analytics
  getInventoryReport(): InventoryReport {
    const products = this.products();
    const purchases = this.purchases();
    const salesReturns = this.salesReturns();
    const purchaseReturns = this.purchaseReturns();

    const totalProducts = products.length;
    const totalStockValue = this.inventoryValue();
    const lowStockItems = this.lowStockProducts().length;
    const outOfStockItems = this.outOfStockProducts().length;

    const totalPurchases = purchases.reduce((sum, p) => sum + p.totalCost, 0);
    const totalSalesReturns = salesReturns
      .filter((r) => r.status === 'approved')
      .reduce((sum, r) => sum + r.totalAmount, 0);
    const totalPurchaseReturns = purchaseReturns
      .filter((r) => r.status === 'approved')
      .reduce((sum, r) => sum + r.totalAmount, 0);

    // This would be calculated from sales data in a real app
    const totalSales = 0;
    const profit =
      totalSales - totalPurchases + totalPurchaseReturns - totalSalesReturns;

    return {
      totalProducts,
      totalStockValue,
      lowStockItems,
      outOfStockItems,
      totalSales,
      totalPurchases,
      totalSalesReturns,
      totalPurchaseReturns,
      profit,
    };
  }

  // Payment Method Management
  addPaymentMethod(method: Omit<PaymentMethod, 'id'>): void {
    const newMethod: PaymentMethod = {
      ...method,
      id: Date.now().toString(),
    };
    this.paymentMethods.update((methods) => [...methods, newMethod]);
  }

  updatePaymentMethod(id: string, updates: Partial<PaymentMethod>): void {
    this.paymentMethods.update((methods) =>
      methods.map((m) => (m.id === id ? { ...m, ...updates } : m))
    );
  }

  deletePaymentMethod(id: string): void {
    this.paymentMethods.update((methods) => methods.filter((m) => m.id !== id));
  }

  // Sales Returns Management
  addSalesReturn(salesReturn: Omit<SalesReturn, 'id'>): void {
    const newReturn: SalesReturn = {
      ...salesReturn,
      id: Date.now().toString(),
    };
    this.salesReturns.update((returns) => [newReturn, ...returns]);

    // If approved, adjust stock
    if (salesReturn.status === 'approved') {
      this.updateProductStock(
        salesReturn.productId,
        salesReturn.quantity,
        'in'
      );
      this.addStockMovement(
        salesReturn.productId,
        salesReturn.productName,
        'in',
        salesReturn.quantity,
        `Sales return - ${salesReturn.reason}`,
        newReturn.id
      );
    }
  }

  updateSalesReturn(id: string, updates: Partial<SalesReturn>): void {
    const currentReturns = this.salesReturns();
    const existingReturn = currentReturns.find((r) => r.id === id);

    if (!existingReturn) return;

    // Handle status changes
    if (updates.status && updates.status !== existingReturn.status) {
      if (
        updates.status === 'approved' &&
        existingReturn.status !== 'approved'
      ) {
        // Approve return - add stock back
        this.updateProductStock(
          existingReturn.productId,
          existingReturn.quantity,
          'in'
        );
        this.addStockMovement(
          existingReturn.productId,
          existingReturn.productName,
          'in',
          existingReturn.quantity,
          `Sales return approved - ${existingReturn.reason}`,
          id
        );
      } else if (
        existingReturn.status === 'approved' &&
        updates.status !== 'approved'
      ) {
        // Unapprove return - remove stock
        this.updateProductStock(
          existingReturn.productId,
          existingReturn.quantity,
          'out'
        );
        this.addStockMovement(
          existingReturn.productId,
          existingReturn.productName,
          'out',
          existingReturn.quantity,
          `Sales return unapproved - ${existingReturn.reason}`,
          id
        );
      }
    }

    this.salesReturns.update((returns) =>
      returns.map((r) => (r.id === id ? { ...r, ...updates } : r))
    );
  }

  deleteSalesReturn(id: string): void {
    const currentReturns = this.salesReturns();
    const returnToDelete = currentReturns.find((r) => r.id === id);

    if (!returnToDelete) return;

    // If it was approved, reverse the stock adjustment
    if (returnToDelete.status === 'approved') {
      this.updateProductStock(
        returnToDelete.productId,
        returnToDelete.quantity,
        'out'
      );
      this.addStockMovement(
        returnToDelete.productId,
        returnToDelete.productName,
        'out',
        returnToDelete.quantity,
        `Sales return deleted - ${returnToDelete.reason}`,
        id
      );
    }

    this.salesReturns.update((returns) => returns.filter((r) => r.id !== id));
  }

  // Purchase Returns Management
  addPurchaseReturn(purchaseReturn: Omit<PurchaseReturn, 'id'>): void {
    const newReturn: PurchaseReturn = {
      ...purchaseReturn,
      id: Date.now().toString(),
    };
    this.purchaseReturns.update((returns) => [newReturn, ...returns]);

    // If approved, adjust stock
    if (purchaseReturn.status === 'approved') {
      this.updateProductStock(
        purchaseReturn.productId,
        purchaseReturn.quantity,
        'out'
      );
      this.addStockMovement(
        purchaseReturn.productId,
        purchaseReturn.productName,
        'out',
        purchaseReturn.quantity,
        `Purchase return - ${purchaseReturn.reason}`,
        newReturn.id
      );
    }
  }

  updatePurchaseReturn(id: string, updates: Partial<PurchaseReturn>): void {
    const currentReturns = this.purchaseReturns();
    const existingReturn = currentReturns.find((r) => r.id === id);

    if (!existingReturn) return;

    // Handle status changes
    if (updates.status && updates.status !== existingReturn.status) {
      if (
        updates.status === 'approved' &&
        existingReturn.status !== 'approved'
      ) {
        // Approve return - remove stock
        this.updateProductStock(
          existingReturn.productId,
          existingReturn.quantity,
          'out'
        );
        this.addStockMovement(
          existingReturn.productId,
          existingReturn.productName,
          'out',
          existingReturn.quantity,
          `Purchase return approved - ${existingReturn.reason}`,
          id
        );
      } else if (
        existingReturn.status === 'approved' &&
        updates.status !== 'approved'
      ) {
        // Unapprove return - add stock back
        this.updateProductStock(
          existingReturn.productId,
          existingReturn.quantity,
          'in'
        );
        this.addStockMovement(
          existingReturn.productId,
          existingReturn.productName,
          'in',
          existingReturn.quantity,
          `Purchase return unapproved - ${existingReturn.reason}`,
          id
        );
      }
    }

    this.purchaseReturns.update((returns) =>
      returns.map((r) => (r.id === id ? { ...r, ...updates } : r))
    );
  }

  deletePurchaseReturn(id: string): void {
    const currentReturns = this.purchaseReturns();
    const returnToDelete = currentReturns.find((r) => r.id === id);

    if (!returnToDelete) return;

    // If it was approved, reverse the stock adjustment
    if (returnToDelete.status === 'approved') {
      this.updateProductStock(
        returnToDelete.productId,
        returnToDelete.quantity,
        'in'
      );
      this.addStockMovement(
        returnToDelete.productId,
        returnToDelete.productName,
        'in',
        returnToDelete.quantity,
        `Purchase return deleted - ${returnToDelete.reason}`,
        id
      );
    }

    this.purchaseReturns.update((returns) =>
      returns.filter((r) => r.id !== id)
    );
  }

  // Search and Filter
  searchProducts(query: string): Product[] {
    if (!query.trim()) return this.products();

    const lowerQuery = query.toLowerCase();
    return this.products().filter(
      (product) =>
        product.name.toLowerCase().includes(lowerQuery) ||
        product.category.toLowerCase().includes(lowerQuery) ||
        product.barcode?.includes(query) ||
        product.supplier?.toLowerCase().includes(lowerQuery)
    );
  }

  getProductsByCategory(categoryName: string): Product[] {
    return this.products().filter(
      (product) => product.category === categoryName
    );
  }

  getProductsBySupplier(supplierName: string): Product[] {
    return this.products().filter(
      (product) => product.supplier === supplierName
    );
  }
}
