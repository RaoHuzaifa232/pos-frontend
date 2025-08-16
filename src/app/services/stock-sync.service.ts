import { Injectable, inject } from '@angular/core';
import { InventoryService } from './inventory.service';
import { NotificationService } from './notification.service';

@Injectable({
    providedIn: 'root'
})
export class StockSyncService {
    private inventoryService = inject(InventoryService);
    private notificationService = inject(NotificationService);

    constructor() {
        // No initialization needed to avoid circular dependency
    }

    // Removed methods that caused circular dependency

    // Method to handle sales and automatically update stock
    processSale(orderId: string, items: Array<{ productId: string, productName: string, quantity: number }>) {
        items.forEach(item => {
            const currentStock = this.getCurrentStock(item.productId);

            this.inventoryService.updateProductStock(item.productId, item.quantity, 'out');
            this.inventoryService.addStockMovement(
                item.productId,
                item.productName,
                'out',
                item.quantity,
                `Sale - Order #${orderId}`,
                orderId
            );

            const newStock = currentStock - item.quantity;

            // Show stock update notification
            this.notificationService.showStockUpdated(
                item.productName,
                newStock,
                'Sale'
            );

            // Check for low stock after sale
            if (this.isLowStock(item.productId)) {
                const product = this.inventoryService.allProducts().find(p => p.id === item.productId);
                if (product) {
                    this.notificationService.showStockAlert(
                        item.productName,
                        newStock,
                        product.minStock
                    );
                }
            }
        });

        // Stock levels updated - cart will be validated on next interaction
    }

    // Method to handle purchase and automatically update stock
    processPurchase(purchaseId: string, productId: string, productName: string, quantity: number, supplier: string) {
        const currentStock = this.getCurrentStock(productId);

        this.inventoryService.updateProductStock(productId, quantity, 'in');
        this.inventoryService.addStockMovement(
            productId,
            productName,
            'in',
            quantity,
            `Purchase from ${supplier}`,
            purchaseId
        );

        const newStock = currentStock + quantity;

        // Show stock update notification
        this.notificationService.showStockUpdated(
            productName,
            newStock,
            'Purchase'
        );
    }

    // Method to handle sales returns and automatically update stock
    processSalesReturn(returnId: string, productId: string, productName: string, quantity: number, approved: boolean) {
        if (approved) {
            this.inventoryService.updateProductStock(productId, quantity, 'in');
            this.inventoryService.addStockMovement(
                productId,
                productName,
                'in',
                quantity,
                'Sales return approved',
                returnId
            );
        }
    }

    // Method to handle purchase returns and automatically update stock
    processPurchaseReturn(returnId: string, productId: string, productName: string, quantity: number, approved: boolean) {
        if (approved) {
            this.inventoryService.updateProductStock(productId, quantity, 'out');
            this.inventoryService.addStockMovement(
                productId,
                productName,
                'out',
                quantity,
                'Purchase return approved',
                returnId
            );
        }
    }

    // Method to validate stock availability before operations
    validateStockAvailability(productId: string, requiredQuantity: number): { available: boolean, currentStock: number, message?: string } {
        const product = this.inventoryService.allProducts().find(p => p.id === productId);

        if (!product) {
            return {
                available: false,
                currentStock: 0,
                message: 'Product not found'
            };
        }

        if (product.stock < requiredQuantity) {
            return {
                available: false,
                currentStock: product.stock,
                message: `Insufficient stock. Available: ${product.stock}, Required: ${requiredQuantity}`
            };
        }

        return {
            available: true,
            currentStock: product.stock
        };
    }

    // Method to get real-time stock level
    getCurrentStock(productId: string): number {
        const product = this.inventoryService.allProducts().find(p => p.id === productId);
        return product ? product.stock : 0;
    }

    // Method to check if product is low stock
    isLowStock(productId: string): boolean {
        const product = this.inventoryService.allProducts().find(p => p.id === productId);
        return product ? product.stock <= product.minStock : false;
    }

    // Method to check if product is out of stock
    isOutOfStock(productId: string): boolean {
        const product = this.inventoryService.allProducts().find(p => p.id === productId);
        return product ? product.stock === 0 : true;
    }
}