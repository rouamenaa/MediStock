import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Order, OrderItem } from '../../../models/order.model';
import { OrderService } from '../../../services/order.service';
import { CatalogApiService } from '../../../services/catalog-api.service';
import { MedicationCatalog } from '../../../models/catalog-medication.model';
import { Pharmacy, PharmacyService } from '../../pharmacy/services/pharmacy.service';

@Component({
  selector: 'app-order-form',
  templateUrl: './order-form.component.html',
  styleUrls: ['./order-form.component.css']
})
export class OrderFormComponent implements OnInit {

  order: Order = {
    patientId: '',
    patientName: '',
    pharmacyId: 0,
    notes: '',
    items: []
  };

  medications: MedicationCatalog[] = [];
  pharmacies: Pharmacy[] = [];
  loading = false;
  loadingLookups = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private orderService: OrderService,
    private catalogApiService: CatalogApiService,
    private pharmacyService: PharmacyService,
    private router: Router
  ) {
    this.addItem();
  }

  ngOnInit(): void {
    this.loadLookups();
  }

  loadLookups(): void {
    this.loadingLookups = true;
    this.errorMessage = '';
    this.pharmacyService.getAll().subscribe({
      next: pharmacies => {
        this.pharmacies = pharmacies;
        if (this.pharmacies.length > 0 && !this.order.pharmacyId) {
          this.order.pharmacyId = this.pharmacies[0].id ?? 0;
        }
        this.loadMedications();
      },
      error: () => {
        this.loadingLookups = false;
        this.errorMessage = 'Impossible de charger les pharmacies.';
      }
    });
  }

  loadMedications(): void {
    this.catalogApiService.listMedications().subscribe({
      next: meds => {
        this.medications = meds.filter(m => m.id !== undefined);
        this.loadingLookups = false;
      },
      error: () => {
        this.loadingLookups = false;
        this.errorMessage = 'Impossible de charger les médicaments.';
      }
    });
  }

  addItem(): void {
    this.order.items.push({
      medicationId: 0,
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

  onMedicationChange(item: OrderItem): void {
    const selected = this.medications.find(m => m.id === Number(item.medicationId));
    if (!selected || selected.id === undefined) {
      item.medicationName = '';
      item.medicationCode = '';
      item.dosage = '';
      return;
    }
    item.medicationId = selected.id;
    item.medicationName = selected.name;
    item.medicationCode = selected.productCode || '';
    item.dosage = selected.dosage || '';
  }

  calculateTotal(): number {
    return this.order.items.reduce((sum, item) =>
      sum + (item.unitPrice || 0) * (item.quantity || 0), 0);
  }

  onSubmit(): void {
    if (!this.isFormValid()) return;
    this.loading = true;
    this.errorMessage = '';

    const orderToSend: Order = {
      ...this.order,
      pharmacyId: Number(this.order.pharmacyId),
      items: this.order.items.map(item => ({
        ...item,
        medicationId: Number(item.medicationId) || 0,
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
    if (this.order.items.some(i => !i.medicationId || !i.medicationName || i.quantity < 1)) {
      this.errorMessage = 'Veuillez remplir correctement tous les médicaments.';
      return false;
    }
    return true;
  }

  trackByIndex(index: number): number { return index; }
}
