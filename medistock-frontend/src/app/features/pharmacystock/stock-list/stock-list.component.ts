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

  newStockItem: StockItem = {
    pharmacyId: 1,
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
    this.loadStockItems();
    this.loadMedications();
  }

  loadStockItems(): void {
    this.stockItemService.getAll().subscribe({
      next: items => {
        this.stockItems = items;
        this.filteredStockItems = items;
      },
      error: () => this.errorMessage = 'Erreur lors du chargement des stocks'
    });
  }

  loadMedications(): void {
    this.medicationService.getAll().subscribe({
      next: meds => this.medications = meds,
      error: () => this.errorMessage = 'Erreur chargement médicaments'
    });
  }

  filterStock(): void {
    if (!this.searchTerm.trim()) {
      this.filteredStockItems = this.stockItems;
      return;
    }

    const term = this.searchTerm.toLowerCase();

    this.filteredStockItems = this.stockItems.filter(item =>
      item.medication.name.toLowerCase().includes(term)
    );
  }

  resetFilter(): void {
    this.searchTerm = '';
    this.filteredStockItems = this.stockItems;
  }

  addStockItem(): void {
    if (this.newStockItem.medication.id === 0) {
      this.errorMessage = 'Veuillez sélectionner un médicament';
      return;
    }

    this.stockItemService.create(this.newStockItem).subscribe({
      next: () => {
        this.loadStockItems();
        this.newStockItem = {
          pharmacyId: 1,
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

  deleteItem(item: StockItem): void {
    if (item.id === undefined) return;

    if (confirm(`Voulez-vous supprimer le stock ${item.medication.name}?`)) {
      this.stockItemService.delete(item.id).subscribe({
        next: () => this.loadStockItems(),
        error: () => this.errorMessage = 'Impossible de supprimer ce stock'
      });
    }
  }

  consumeStock(item: StockItem, quantity: number, reference: string): void {
    if (item.id === undefined || !quantity || quantity <= 0) return;

    this.stockItemService.consume(item.id, quantity, reference).subscribe({
      next: () => this.loadStockItems(),
      error: () => this.errorMessage = 'Erreur consommation stock'
    });
  }

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
    return item.totalQuantity > 0 &&
           item.totalQuantity <= item.lowStockThreshold;
  }

  isOutOfStock(item: StockItem): boolean {
    return item.totalQuantity === 0;
  }
}