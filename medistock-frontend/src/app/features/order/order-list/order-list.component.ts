import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Order, OrderStatus } from '../../../models/order.model';
import { OrderService } from '../../../services/order.service';

@Component({
  selector: 'app-order-list',
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.css']
})
export class OrderListComponent implements OnInit {

  orders: Order[] = [];
  filteredOrders: Order[] = [];
  loading = false;
  errorMessage = '';
  successMessage = '';
  searchTerm = '';
  selectedStatus = '';

  orderStatuses = Object.values(OrderStatus);
  openDropdownId: number | null = null;

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    this.orderService.getAllOrders().subscribe({
      next: (data) => {
        this.orders = data;
        this.filteredOrders = data;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Erreur lors du chargement des commandes.';
        this.loading = false;
      }
    });
  }

  filterOrders(): void {
    this.filteredOrders = this.orders.filter(order => {
      const matchSearch = !this.searchTerm ||
        order.patientName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        order.orderNumber?.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchStatus = !this.selectedStatus || order.status === this.selectedStatus;
      return matchSearch && matchStatus;
    });
  }

  updateStatus(order: Order, status: OrderStatus): void {
    this.orderService.updateStatus(order.id!, status).subscribe({
      next: (updated) => {
        const index = this.orders.findIndex(o => o.id === updated.id);
        if (index !== -1) this.orders[index] = updated;
        this.filterOrders();
        this.successMessage = `Statut mis à jour : ${status}`;
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: () => this.errorMessage = 'Erreur lors de la mise à jour du statut.'
    });
  }

  cancelOrder(order: Order): void {
    if (!confirm(`Annuler la commande ${order.orderNumber} ?`)) return;
    this.orderService.cancelOrder(order.id!).subscribe({
      next: (updated) => {
        const index = this.orders.findIndex(o => o.id === updated.id);
        if (index !== -1) this.orders[index] = updated;
        this.filterOrders();
        this.successMessage = 'Commande annulée.';
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: () => this.errorMessage = "Erreur lors de l'annulation."
    });
  }

  deleteOrder(id: number): void {
    if (!confirm('Supprimer cette commande ?')) return;
    this.orderService.deleteOrder(id).subscribe({
      next: () => {
        this.orders = this.orders.filter(o => o.id !== id);
        this.filterOrders();
        this.successMessage = 'Commande supprimée.';
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: () => this.errorMessage = 'Erreur lors de la suppression.'
    });
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      PENDING: 'badge-warning',
      CONFIRMED: 'badge-info',
      PROCESSING: 'badge-primary',
      READY: 'badge-success',
      DELIVERED: 'badge-delivered',
      CANCELLED: 'badge-danger',
      REJECTED: 'badge-secondary'
    };
    return map[status] || 'badge-secondary';
  }

  toggleDropdown(id: number): void {
    this.openDropdownId = this.openDropdownId === id ? null : id;
  }

  getNextStatuses(status: string): OrderStatus[] {
    const transitions: Record<string, OrderStatus[]> = {
      PENDING: [OrderStatus.CONFIRMED, OrderStatus.REJECTED],
      CONFIRMED: [OrderStatus.PROCESSING],
      PROCESSING: [OrderStatus.READY],
      READY: [OrderStatus.DELIVERED]
    };
    return transitions[status] || [];
  }
}