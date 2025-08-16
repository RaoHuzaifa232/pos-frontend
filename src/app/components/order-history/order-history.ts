import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Calendar, DollarSign, User, CreditCard } from 'lucide-angular';
import { PosService } from '../../services/pos.service';

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './order-history.html'
})
export class OrderHistory {
  readonly calendarIcon = Calendar;
  readonly dollarIcon = DollarSign;
  readonly userIcon = User;
  readonly creditCardIcon = CreditCard;

  constructor(public posService: PosService) {}

  getPaymentMethodName(method: string): string {
    const methods: { [key: string]: string } = {
      'cash': 'Cash',
      'card': 'Card',
      'digital': 'Digital'
    };
    return methods[method] || method;
  }

  trackByOrderId(index: number, order: any): string {
    return order.id;
  }
}