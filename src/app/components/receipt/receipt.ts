import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Download, LucideAngularModule, Printer, X } from 'lucide-angular';
import { Order } from '../../models/product.model';

@Component({
  selector: 'app-receipt',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './receipt.html',
})
export class Receipt {
  @Input() order!: Order;
  @Output() receiptClosed = new EventEmitter<void>();

  readonly closeIcon = X;
  readonly printerIcon = Printer;
  readonly downloadIcon = Download;

  getPaymentMethodName(method: string): string {
    const methods: { [key: string]: string } = {
      cash: 'Cash',
      card: 'Credit/Debit Card',
      digital: 'Digital Wallet',
    };
    return methods[method] || method;
  }

  printReceipt() {
    window.print();
  }

  downloadReceipt() {
    // In a real app, this would generate a PDF or other format
    console.log('Downloading receipt...', this.order);
  }

  closeReceipt() {
    this.receiptClosed.emit();
  }
}
