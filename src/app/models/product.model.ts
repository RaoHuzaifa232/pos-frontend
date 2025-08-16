export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image?: string;
  stock: number;
  barcode?: string;
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
}

export interface Category {
  id: string;
  name: string;
  color: string;
}