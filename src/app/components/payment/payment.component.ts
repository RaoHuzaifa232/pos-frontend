import { Component, EventEmitter, Output, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, CreditCard, Banknote, Smartphone, X, Check } from 'lucide-angular';
import { PosService } from '../../services/pos.service';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-100">
        <!-- Header -->
        <div class="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 class="text-2xl font-bold text-gray-800">Payment</h2>
          <button
            (click)="closePayment()"
            class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <lucide-icon [img]="closeIcon" class="w-6 h-6 text-gray-500"></lucide-icon>
          </button>
        </div>

        <!-- Order Summary -->
        <div class="p-6 border-b border-gray-200 bg-gray-50">
          <h3 class="font-semibold text-gray-800 mb-3">Order Summary</h3>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-600">Items ({{ itemCount() }}):</span>
              <span>\${{ subtotal() | number:'1.2-2' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Tax:</span>
              <span>\${{ tax() | number:'1.2-2' }}</span>
            </div>
            <div class="flex justify-between font-bold text-lg border-t pt-2">
              <span>Total:</span>
              <span class="text-green-600">\${{ total() | number:'1.2-2' }}</span>
            </div>
          </div>
        </div>

        <!-- Payment Methods -->
        <div class="p-6">
          <h3 class="font-semibold text-gray-800 mb-4">Payment Method</h3>
          
          <div class="space-y-3 mb-6">
            <button
              *ngFor="let method of paymentMethods"
              (click)="selectedPaymentMethod.set(method.id)"
              [class]="'w-full p-4 border-2 rounded-xl transition-all duration-200 flex items-center gap-3 ' +
                       (selectedPaymentMethod() === method.id ? 
                        'border-blue-500 bg-blue-50' : 
                        'border-gray-200 hover:border-gray-300 hover:bg-gray-50')"
            >
              <lucide-icon [img]="method.icon" class="w-6 h-6 text-gray-600"></lucide-icon>
              <div class="flex-1 text-left">
                <div class="font-semibold text-gray-800">{{ method.name }}</div>
                <div class="text-sm text-gray-500">{{ method.description }}</div>
              </div>
              <div *ngIf="selectedPaymentMethod() === method.id" 
                   class="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                <lucide-icon [img]="checkIcon" class="w-4 h-4 text-white"></lucide-icon>
              </div>
            </button>
          </div>

          <!-- Customer Name (Optional) -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Customer Name (Optional)
            </label>
            <input
              type="text"
              [(ngModel)]="customerName"
              placeholder="Enter customer name..."
              class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>

          <!-- Action Buttons -->
          <div class="space-y-3">
            <button
              (click)="processPayment()"
              [disabled]="!selectedPaymentMethod() || isProcessing()"
              class="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-4 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2"
            >
              <span *ngIf="!isProcessing()">Complete Payment</span>
              <span *ngIf="isProcessing()" class="flex items-center gap-2">
                <div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Processing...
              </span>
            </button>
            
            <button
              (click)="closePayment()"
              class="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 px-6 rounded-xl font-medium transition-colors duration-200"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class PaymentComponent {
  @Output() paymentComplete = new EventEmitter<void>();
  @Output() paymentCancelled = new EventEmitter<void>();

  readonly closeIcon = X;
  readonly checkIcon = Check;

  selectedPaymentMethod = signal<string>('');
  customerName = signal<string>('');
  isProcessing = signal<boolean>(false);

  paymentMethods = [
    {
      id: 'cash',
      name: 'Cash',
      description: 'Pay with cash',
      icon: Banknote
    },
    {
      id: 'card',
      name: 'Credit/Debit Card',
      description: 'Pay with card',
      icon: CreditCard
    },
    {
      id: 'digital',
      name: 'Digital Wallet',
      description: 'Apple Pay, Google Pay, etc.',
      icon: Smartphone
    }
  ];

  constructor(private posService: PosService) {}

  itemCount = computed(() => this.posService.getCartItemCount());
  subtotal = computed(() => this.posService.getCartTotal());
  tax = computed(() => this.subtotal() * 0.08);
  total = computed(() => this.subtotal() + this.tax());

  processPayment() {
    if (!this.selectedPaymentMethod()) return;

    this.isProcessing.set(true);

    // Simulate payment processing
    setTimeout(() => {
      const paymentMethod = this.selectedPaymentMethod() as 'cash' | 'card' | 'digital';
      const customerName = this.customerName().trim() || undefined;
      
      this.posService.processOrder(paymentMethod, customerName);
      this.isProcessing.set(false);
      this.paymentComplete.emit();
    }, 2000);
  }

  closePayment() {
    this.paymentCancelled.emit();
  }
}