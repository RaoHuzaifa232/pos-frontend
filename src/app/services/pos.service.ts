import { Injectable, signal } from '@angular/core';
import { Product, CartItem, Order, Category } from '../models/product.model';

@Injectable({
  providedIn: 'root'
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

  constructor() {
    this.initializeData();
  }

  private initializeData() {
    // Sample categories
    const sampleCategories: Category[] = [
      { id: '1', name: 'Beverages', color: 'bg-blue-500' },
      { id: '2', name: 'Food', color: 'bg-green-500' },
      { id: '3', name: 'Snacks', color: 'bg-yellow-500' },
      { id: '4', name: 'Electronics', color: 'bg-purple-500' }
    ];

    // Sample products
    const sampleProducts: Product[] = [
      { id: '1', name: 'Coffee', price: 4.99, category: 'Beverages', stock: 50, barcode: '123456789' },
      { id: '2', name: 'Sandwich', price: 8.99, category: 'Food', stock: 25, barcode: '987654321' },
      { id: '3', name: 'Chips', price: 2.99, category: 'Snacks', stock: 100, barcode: '456789123' },
      { id: '4', name: 'Soda', price: 1.99, category: 'Beverages', stock: 75, barcode: '789123456' },
      { id: '5', name: 'Burger', price: 12.99, category: 'Food', stock: 20, barcode: '321654987' },
      { id: '6', name: 'Headphones', price: 29.99, category: 'Electronics', stock: 15, barcode: '654987321' }
    ];

    this.categories.set(sampleCategories);
    this.products.set(sampleProducts);
  }

  addToCart(product: Product, quantity: number = 1) {
    const currentCart = this.cart();
    const existingItem = currentCart.find(item => item.product.id === product.id);

    if (existingItem) {
      existingItem.quantity += quantity;
      existingItem.subtotal = existingItem.quantity * existingItem.product.price;
    } else {
      const newItem: CartItem = {
        product,
        quantity,
        subtotal: quantity * product.price
      };
      currentCart.push(newItem);
    }

    this.cart.set([...currentCart]);
  }

  removeFromCart(productId: string) {
    const currentCart = this.cart();
    const updatedCart = currentCart.filter(item => item.product.id !== productId);
    this.cart.set(updatedCart);
  }

  updateQuantity(productId: string, quantity: number) {
    const currentCart = this.cart();
    const item = currentCart.find(item => item.product.id === productId);
    
    if (item) {
      if (quantity <= 0) {
        this.removeFromCart(productId);
      } else {
        item.quantity = quantity;
        item.subtotal = quantity * item.product.price;
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

  processOrder(paymentMethod: 'cash' | 'card' | 'digital', customerName?: string): Order {
    const cartItems = this.cart();
    const subtotal = this.getCartTotal();
    const tax = subtotal * 0.08; // 8% tax
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
      customerName
    };

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

    return allProducts.filter(product =>
      product.name.toLowerCase().includes(query.toLowerCase()) ||
      product.barcode?.includes(query) ||
      product.category.toLowerCase().includes(query.toLowerCase())
    );
  }

  getProductsByCategory(categoryName: string): Product[] {
    return this.products().filter(product => product.category === categoryName);
  }
}