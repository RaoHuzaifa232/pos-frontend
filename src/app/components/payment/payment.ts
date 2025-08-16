import { Component, EventEmitter, Output, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, CreditCard, Banknote, Smartphone, X, Check } from 'lucide-angular';
import { PosService } from '../../services/pos.service';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './payment.html'
})
export class Payment {
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