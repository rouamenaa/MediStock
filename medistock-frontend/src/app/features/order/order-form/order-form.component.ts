import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Order, OrderItem } from '../../../models/order.model';
import { OrderService } from '../../../services/order.service';

@Component({
  selector: 'app-order-form',
  templateUrl: './order-form.component.html',
  styleUrls: ['./order-form.component.css']
})
export class OrderFormComponent {

  order: Order = {
    patientId: '',
    patientName: '',
    pharmacyId: 1,   // ✅ valeur par défaut 1 (pas 0)
    notes: '',
    items: []
  };

  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(private orderService: OrderService, private router: Router) {
    this.addItem();
  }

  addItem(): void {
    this.order.items.push({
      medicationId: 1,       // ✅ valeur par défaut 1 (pas 0)
      medicationName: '',
      medicationCode: '',
      quantity: 1,
      unitPrice: 0,
      dosage: '',
      instructions: ''
    });
  }

  removeItem(index: number): void {
    if (this.order.items.length > 1) {
      this.order.items.splice(index, 1);
    }
  }

  calculateTotal(): number {
    return this.order.items.reduce((sum, item) =>
      sum + (item.unitPrice || 0) * (item.quantity || 0), 0);
  }

  onSubmit(): void {
    if (!this.isFormValid()) return;
    this.loading = true;
    this.errorMessage = '';

    // ✅ Nettoyer et convertir les types avant envoi
    const orderToSend: Order = {
      ...this.order,
      pharmacyId: Number(this.order.pharmacyId),
      items: this.order.items.map(item => ({
        ...item,
        medicationId: Number(item.medicationId) || 1,
        quantity:     Number(item.quantity)     || 1,
        unitPrice:    Number(item.unitPrice)    || 0,
      }))
    };

    this.orderService.createOrder(orderToSend).subscribe({
      next: (created) => {
        this.successMessage = `Commande ${created.orderNumber} créée avec succès !`;
        this.loading = false;
        setTimeout(() => this.router.navigate(['/orders']), 1500);
      },
      error: (err) => {
        this.errorMessage = 'Erreur : ' + (err?.error?.message || err?.message || 'Erreur inconnue');
        this.loading = false;
      }
    });
  }

  isFormValid(): boolean {
    if (!this.order.patientId || !this.order.patientName || !this.order.pharmacyId) {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires.';
      return false;
    }
    if (this.order.items.some(i => !i.medicationName || i.quantity < 1)) {
      this.errorMessage = 'Veuillez remplir correctement tous les médicaments.';
      return false;
    }
    return true;
  }

  trackByIndex(index: number): number { return index; }
}