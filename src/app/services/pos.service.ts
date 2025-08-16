import { Injectable, signal, inject } from '@angular/core';
import { Product, CartItem, Order, Category } from '../models/product.model';
import { InventoryService } from './inventory.service';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root',
})
export class PosService {
  private cart = signal<CartItem[]>([]);
  private products = signal<Product[]>([]);
  private categories = signal<Category[]>([]);
  private orders = signal<Order[]>([]);

  // Public signals for components
  readonly cartItems = this.cart.asReadonly();
  readonly allProducts = this.products.asReadonly();
  readonly allCategories = this.categories.asReadonly();
  readonly allOrders = this.orders.asReadonly();

  private inventoryService = inject(InventoryService);
  private notificationService = inject(NotificationService);

  constructor() {
    this.initializeData();
  }

  private initializeData() {
    // This service now primarily handles cart and order operations
    // Product data comes from InventoryService
  }

  addToCart(product: Product, quantity: number = 1) {
    // Get current product from inventory to ensure we have latest stock
    const currentProduct = this.inventoryService
      .allProducts()
      .find((p) => p.id === product.id);
    if (!currentProduct) {
      throw new Error('Product not found');
    }

    // Validate stock availability
    const existingItem = this.cart().find(
      (item) => item.product.id === product.id
    );
    const currentQuantityInCart = existingItem ? existingItem.quantity : 0;
    const totalRequiredQuantity = currentQuantityInCart + quantity;

    if (currentProduct.stock < totalRequiredQuantity) {
      throw new Error(
        `Insufficient stock. Available: ${currentProduct.stock}, Required: ${totalRequiredQuantity}`
      );
    }

    const currentCart = this.cart();

    if (existingItem) {
      existingItem.quantity += quantity;
      existingItem.subtotal =
        existingItem.quantity * existingItem.product.sellingPrice;
      // Update product reference to latest
      existingItem.product = currentProduct;
    } else {
      const newItem: CartItem = {
        product: currentProduct,
        quantity,
        subtotal: quantity * currentProduct.sellingPrice,
      };
      currentCart.push(newItem);
    }

    this.cart.set([...currentCart]);
  }

  removeFromCart(productId: string) {
    const currentCart = this.cart();
    const updatedCart = currentCart.filter(
      (item) => item.product.id !== productId
    );
    this.cart.set(updatedCart);
  }

  updateQuantity(productId: string, quantity: number) {
    const currentCart = this.cart();
    const item = currentCart.find((item) => item.product.id === productId);

    if (item) {
      if (quantity <= 0) {
        this.removeFromCart(productId);
      } else {
        // Get current product from inventory to validate stock
        const currentProduct = this.inventoryService
          .allProducts()
          .find((p) => p.id === productId);
        if (!currentProduct) {
          throw new Error('Product not found');
        }

        if (currentProduct.stock < quantity) {
          throw new Error(
            `Insufficient stock. Available: ${currentProduct.stock}, Required: ${quantity}`
          );
        }

        item.quantity = quantity;
        item.subtotal = quantity * item.product.sellingPrice;
        // Update product reference to latest
        item.product = currentProduct;
        this.cart.set([...currentCart]);
      }
    }
  }

  getCartTotal(): number {
    return this.cart().reduce((total, item) => total + item.subtotal, 0);
  }

  getCartItemCount(): number {
    return this.cart().reduce((count, item) => count + item.quantity, 0);
  }

  clearCart() {
    this.cart.set([]);
  }

  processOrder(
    paymentMethod: 'cash' | 'card' | 'digital',
    customerName?: string
  ): Order {
    const cartItems = this.cart();
    const subtotal = this.getCartTotal();
    const tax = subtotal * 0; // 8% tax
    const discount = 0; // Can be implemented later
    const finalTotal = subtotal + tax - discount;

    const order: Order = {
      id: Date.now().toString(),
      items: [...cartItems],
      total: subtotal,
      tax,
      discount,
      finalTotal,
      paymentMethod,
      timestamp: new Date(),
      customerName,
      type: 'sale',
    };

    // Update stock levels for each item sold
    cartItems.forEach((item) => {
      const currentStock = item.product.stock;

      this.inventoryService.updateProductStock(
        item.product.id,
        item.quantity,
        'out'
      );
      this.inventoryService.addStockMovement(
        item.product.id,
        item.product.name,
        'out',
        item.quantity,
        `Sale - Order #${order.id}`,
        order.id
      );

      const newStock = currentStock - item.quantity;

      // Show stock update notification
      this.notificationService.showStockUpdated(
        item.product.name,
        newStock,
        'Sale'
      );

      // Check for low stock after sale
      const updatedProduct = this.inventoryService
        .allProducts()
        .find((p) => p.id === item.product.id);
      if (updatedProduct && updatedProduct.stock <= updatedProduct.minStock) {
        this.notificationService.showStockAlert(
          item.product.name,
          updatedProduct.stock,
          updatedProduct.minStock
        );
      }
    });

    // Add to orders history
    const currentOrders = this.orders();
    this.orders.set([order, ...currentOrders]);

    // Clear cart
    this.clearCart();

    return order;
  }

  searchProducts(query: string): Product[] {
    const allProducts = this.products();
    if (!query.trim()) return allProducts;

    return allProducts.filter(
      (product) =>
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.barcode?.includes(query) ||
        product.category.toLowerCase().includes(query.toLowerCase())
    );
  }

  getProductsByCategory(categoryName: string): Product[] {
    return this.products().filter(
      (product) => product.category === categoryName
    );
  }
}
