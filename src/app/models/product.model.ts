export interface Product {
  _id: string;
  name: string;
  sellingPrice: number;
  costPrice: number;
  category: string;
  image?: string;
  stock: number;
  minStock: number;
  barcode?: string;
  supplier?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CartItem {
  product: Product;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  tax: number;
  discount: number;
  finalTotal: number;
  paymentMethod: 'cash' | 'card' | 'digital';
  timestamp: Date;
  customerName?: string;
  type: 'sale' | 'purchase';
}

export interface Category {
  _id: string;
  name: string;
  color: string;
  description?: string;
}

export interface Purchase {
  _id: string;
  productId: string;
  productName: string;
  quantity: number;
  costPrice: number;
  totalCost: number;
  supplier: string;
  invoiceNumber?: string;
  purchaseDate: Date;
  notes?: string;
}

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  reason: string;
  timestamp: Date;
  reference?: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  email?: string;
  address?: string;
  phone?: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  type: 'cash' | 'bank' | 'digital';
  accountNumber?: string;
  isActive: boolean;
}

export interface SalesReturn {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  reason: string;
  returnDate: Date;
  customerName?: string;
  notes?: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface PurchaseReturn {
  id: string;
  purchaseId: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  reason: string;
  returnDate: Date;
  supplier: string;
  notes?: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface InventoryReport {
  totalProducts: number;
  totalStockValue: number;
  lowStockItems: number;
  outOfStockItems: number;
  totalSales: number;
  totalPurchases: number;
  totalSalesReturns: number;
  totalPurchaseReturns: number;
  profit: number;
}
