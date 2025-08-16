import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Package, TrendingUp, TrendingDown, AlertTriangle, DollarSign, ShoppingCart } from 'lucide-angular';
import { InventoryService } from '../../services/inventory.service';

@Component({
    selector: 'app-inventory-dashboard',
    standalone: true,
    imports: [CommonModule, LucideAngularModule],
    templateUrl: './inventory-dashboard.html'
})
export class InventoryDashboard {
    readonly packageIcon = Package;
    readonly dollarIcon = DollarSign;
    readonly alertIcon = AlertTriangle;
    readonly trendingUpIcon = TrendingUp;
    readonly trendingDownIcon = TrendingDown;
    readonly shoppingCartIcon = ShoppingCart;

    constructor(public inventoryService: InventoryService) { }

    inventoryReport = computed(() => this.inventoryService.getInventoryReport());

    getProductCountByCategory(categoryName: string): number {
        return this.inventoryService.getProductsByCategory(categoryName).length;
    }
}