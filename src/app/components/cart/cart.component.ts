import { Component, computed, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, ShoppingCart, Plus, Minus, Trash2, CreditCard } from 'lucide-angular';
import { PosService } from '../../services/pos.service';
import { CartItem } from '../../models/product.model';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="h-full flex flex-col bg-white">
      <!-- Cart Header -->
      <div class="p-4 border-b border-gray-200 bg-gray-50">
        <div class="flex items-center gap-3">
          <lucide-icon [img]="cartIcon" class="w-6 h-6 text-blue-600"></lucide-icon>
          <h2 class="text-xl font-bold text-gray-800">Shopping Cart</h2>
          <span class="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
            {{ cartItemCount() }}
          </span>
        </div>
      </div>

      <!-- Cart Items -->
      <div class="flex-1 overflow-y-auto p-4">
        <div *ngIf="posService.cartItems().length === 0" class="text-center py-12">
          <div class="text-6xl mb-4">🛒</div>
          <h3 class="text-lg font-semibold text-gray-600 mb-2">Your cart is empty</h3>
          <p class="text-gray-500">Add some products to get started</p>
        </div>

        <div class="space-y-3">
          <div
            *ngFor="let item of posService.cartItems(); trackBy: trackByItemId"
            class="bg-gray-50 rounded-lg p-4 transition-all duration-200 hover:shadow-md"
          >
            <div class="flex items-start gap-3">
              <!-- Product Image -->
              <div class="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center flex-shrink-0">
                <span class="text-lg">🛍️</span>
              </div>

              <!-- Product Details -->
              <div class="flex-1 min-w-0">
                <h3 class="font-semibold text-gray-800 truncate">{{ item.product.name }}</h3>
                <p class="text-sm text-gray-500">{{ item.product.category }}</p>
                <p class="text-lg font-bold text-green-600">\${{ item.product.price | number:'1.2-2' }}</p>
              </div>

              <!-- Quantity Controls -->
              <div class="flex flex-col items-end gap-2">
                <button
                  (click)="removeItem(item.product.id)"
                  class="text-red-500 hover:text-red-700 transition-colors p-1"
                >
                  <lucide-icon [img]="trashIcon" class="w-4 h-4"></lucide-icon>
                </button>

                <div class="flex items-center gap-2 bg-white rounded-lg border">
                  <button
                    (click)="decreaseQuantity(item.product.id, item.quantity)"
                    class="p-2 hover:bg-gray-100 transition-colors rounded-l-lg"
                  >
                    <lucide-icon [img]="minusIcon" class="w-4 h-4"></lucide-icon>
                  </button>
                  
                  <span class="px-3 py-1 font-semibold min-w-[2rem] text-center">{{ item.quantity }}</span>
                  
                  <button
                    (click)="increaseQuantity(item.product.id, item.quantity)"
                    class="p-2 hover:bg-gray-100 transition-colors rounded-r-lg"
                  >
                    <lucide-icon [img]="plusIcon" class="w-4 h-4"></lucide-icon>
                  </button>
                </div>

                <p class="text-sm font-semibold text-gray-700">
                  \${{ item.subtotal | number:'1.2-2' }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Cart Summary -->
      <div *ngIf="posService.cartItems().length > 0" class="border-t border-gray-200 p-4 bg-gray-50">
        <div class="space-y-3">
          <!-- Totals -->
          <div class="space-y-2">
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">Subtotal:</span>
              <span class="font-medium">\${{ cartTotal() | number:'1.2-2' }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">Tax (8%):</span>
              <span class="font-medium">\${{ cartTax() | number:'1.2-2' }}</span>
            </div>
            <div class="flex justify-between text-lg font-bold border-t pt-2">
              <span>Total:</span>
              <span class="text-green-600">\${{ cartFinalTotal() | number:'1.2-2' }}</span>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="space-y-2">
            <button
              (click)="onProceedToPayment()"
              class="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <lucide-icon [img]="creditCardIcon" class="w-5 h-5"></lucide-icon>
              Proceed to Payment
            </button>
            
            <button
              (click)="clearCart()"
              class="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors duration-200"
            >
              Clear Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class CartComponent {
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
    this.posService.updateQuantity(productId, currentQuantity + 1);
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