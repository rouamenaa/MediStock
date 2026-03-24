import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StockItemService } from '../../../services/stock-item.service';
import { MedicationService } from '../../../services/medication.service';
import { StockItem } from '../../../models/stock-item.model';
import { Medication } from '../../../models/medication.model';

@Component({
  selector: 'app-stock-list',
  templateUrl: './stock-list.component.html',
  styleUrls: ['./stock-list.component.css']
})
export class StockListComponent implements OnInit {

  stockItems: StockItem[] = [];
  filteredStockItems: StockItem[] = [];
  medications: Medication[] = [];
  editingItem: StockItem | null = null;
  errorMessage: string = '';
  searchTerm: string = '';

  sortField: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  newStockItem: StockItem = {
    pharmacyId: 1,
    medicationId: 0,  // <-- utiliser medicationId pour le backend
    medication: { id: 0, name: '', dosage: '' },
    totalQuantity: 0,
    reservedQuantity: 0,
    lowStockThreshold: 5,
    status: 'AVAILABLE'
  };

  constructor(
    private stockItemService: StockItemService,
    private medicationService: MedicationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadMedications(); // Charger les médicaments avant les stocks
  }

  loadMedications(): void {
    this.medicationService.getAll().subscribe({
      next: meds => {
        this.medications = meds;
        this.loadStockItems(); // Charger les stocks après les médicaments
      },
      error: () => this.errorMessage = 'Erreur chargement médicaments'
    });
  }

  loadStockItems(): void {
    this.stockItemService.getAll().subscribe({
      next: items => {
        this.stockItems = items.map(item => {
          const med = this.medications.find(m => m.id === item.medicationId);
          return {
            ...item,
            medication: med || { id: item.medicationId || 0, name: 'Unknown', dosage: '' }
          };
        });
        this.filteredStockItems = this.applySorting(this.stockItems);
      },
      error: () => this.errorMessage = 'Erreur lors du chargement des stocks'
    });
  }

  /* ========================
     SEARCH + SORT
  ======================== */

  filterStock(): void {
    const term = this.searchTerm.toLowerCase().trim();
    let filtered = this.stockItems;

    if (term) {
      filtered = this.stockItems.filter(item =>
        item.medication?.name.toLowerCase().includes(term)
      );
    }

    this.filteredStockItems = this.applySorting(filtered);
  }

  resetFilter(): void {
    this.searchTerm = '';
    this.filteredStockItems = this.applySorting(this.stockItems);
  }

  sortBy(field: string): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    this.filteredStockItems = this.applySorting(this.filteredStockItems);
  }

  applySorting(items: StockItem[]): StockItem[] {
    if (!this.sortField) return items;

    return [...items].sort((a, b) => {
      let valueA: any;
      let valueB: any;

      switch (this.sortField) {
        case 'name':
          valueA = a.medication?.name.toLowerCase() || '';
          valueB = b.medication?.name.toLowerCase() || '';
          break;
        case 'quantity':
          valueA = a.totalQuantity;
          valueB = b.totalQuantity;
          break;
        case 'threshold':
          valueA = a.lowStockThreshold;
          valueB = b.lowStockThreshold;
          break;
        case 'status':
          valueA = this.getStockStatus(a);
          valueB = this.getStockStatus(b);
          break;
        default:
          return 0;
      }

      if (valueA < valueB) return this.sortDirection === 'asc' ? -1 : 1;
      if (valueA > valueB) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  /* ========================
     CRUD
  ======================== */

  addStockItem(): void {
  if (!this.newStockItem.medicationId || this.newStockItem.medicationId === 0) {
    this.errorMessage = 'Veuillez sélectionner un médicament';
    return;
  }

  const selectedMed = this.medications.find(m => m.id === this.newStockItem.medicationId);
  if (!selectedMed) {
    this.errorMessage = 'Médicament invalide';
    return;
  }

  // Construire l'objet complet pour le backend
  const stockToCreate = {
    ...this.newStockItem,
    medication: selectedMed
  };

  this.stockItemService.create(stockToCreate).subscribe({
    next: () => {
      this.loadStockItems();
      this.newStockItem = {
        pharmacyId: 1,
        medicationId: 0,
        medication: { id: 0, name: '', dosage: '' },
        totalQuantity: 0,
        reservedQuantity: 0,
        lowStockThreshold: 5,
        status: 'AVAILABLE'
      };
    },
    error: () => this.errorMessage = 'Erreur lors de la création du stock'
  });
}

  startEdit(item: StockItem): void {
    this.editingItem = { ...item };
  }

  cancelEdit(): void {
    this.editingItem = null;
  }

  updateItem(): void {
    if (!this.editingItem || this.editingItem.id === undefined) return;

    this.stockItemService.update(
      this.editingItem.id,
      this.editingItem.lowStockThreshold
    ).subscribe({
      next: () => {
        this.loadStockItems();
        this.editingItem = null;
      },
      error: () => this.errorMessage = 'Impossible de mettre à jour ce stock'
    });
  }

  deleteItem(item: StockItem): void {
    if (item.id === undefined) return;

    if (confirm(`Voulez-vous supprimer le stock ${item.medication?.name}?`)) {
      this.stockItemService.delete(item.id).subscribe({
        next: () => this.loadStockItems(),
        error: () => this.errorMessage = 'Impossible de supprimer ce stock'
      });
    }
  }

  consumeStock(item: StockItem, quantity: number): void {
    if (item.id === undefined || !quantity || quantity <= 0) return;

    this.stockItemService.consume(item.id, quantity, '').subscribe({
      next: () => this.loadStockItems(),
      error: () => this.errorMessage = 'Erreur consommation stock'
    });
  }

  viewBatches(item: StockItem): void {
    if (item.id !== undefined) {
      this.router.navigate([`/pharmacystock/${item.id}/batches`]);
    }
  }

  viewHistory(item: StockItem): void {
    if (item.id !== undefined) {
      this.router.navigate([`/pharmacystock/${item.id}/history`]);
    }
  }

  /* ========================
     STATUS
  ======================== */

  getStockStatus(item: StockItem): string {
    if (item.totalQuantity === 0) return 'OUT_OF_STOCK';
    if (item.totalQuantity <= item.lowStockThreshold) return 'LOW_STOCK';
    return 'ACTIVE';
  }

  getReadableStatus(item: StockItem): string {
    const status = this.getStockStatus(item);
    switch (status) {
      case 'OUT_OF_STOCK': return 'OUT OF STOCK';
      case 'LOW_STOCK': return 'LOW STOCK';
      default: return 'ACTIVE';
    }
  }

  isLowStock(item: StockItem): boolean {
    return item.totalQuantity > 0 && item.totalQuantity <= item.lowStockThreshold;
  }

  isOutOfStock(item: StockItem): boolean {
    return item.totalQuantity === 0;
  }
}