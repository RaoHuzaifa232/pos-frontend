import { Component, computed, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, ShoppingCart, Plus, Minus, Trash2, CreditCard } from 'lucide-angular';
import { PosService } from '../../services/pos.service';
import { StockStatus } from '../stock-status/stock-status';
import { CartItem } from '../../models/product.model';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, StockStatus],
  templateUrl: './cart.html'
})
export class Cart {
  @Output() proceedToPayment = new EventEmitter<void>();

  readonly cartIcon = ShoppingCart;
  readonly plusIcon = Plus;
  readonly minusIcon = Minus;
  readonly trashIcon = Trash2;
  readonly creditCardIcon = CreditCard;

  constructor(public posService: PosService) {}

  cartItemCount = computed(() => this.posService.getCartItemCount());
  cartTotal = computed(() => this.posService.getCartTotal());
  cartTax = computed(() => this.cartTotal() * 0.08);
  cartFinalTotal = computed(() => this.cartTotal() + this.cartTax());

  increaseQuantity(productId: string, currentQuantity: number) {
    try {
      this.posService.updateQuantity(productId, currentQuantity + 1);
    } catch (error: any) {
      alert(error.message || 'Unable to increase quantity');
    }
  }

  decreaseQuantity(productId: string, currentQuantity: number) {
    this.posService.updateQuantity(productId, currentQuantity - 1);
  }

  removeItem(productId: string) {
    this.posService.removeFromCart(productId);
  }

  clearCart() {
    this.posService.clearCart();
  }

  onProceedToPayment() {
    this.proceedToPayment.emit();
  }

  trackByItemId(index: number, item: CartItem): string {
    return item.product.id;
  }
}