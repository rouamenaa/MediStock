import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { StockItemService } from '../../../services/stock-item.service';
import { MedicationService } from '../../../services/medication.service';
import { StockBatchService } from '../../../services/stock-batch.service';
import { StockItem } from '../../../models/stock-item.model';
import { Medication } from '../../../models/medication.model';
import { StockBatch } from '../../../models/stock-batch.model';
import { Pharmacy, PharmacyService } from '../../pharmacy/services/pharmacy.service';

@Component({
  selector: 'app-stock-list',
  templateUrl: './stock-list.component.html',
  styleUrls: ['./stock-list.component.css']
})
export class StockListComponent implements OnInit, OnDestroy {

  stockItems: StockItem[] = [];
  filteredStockItems: StockItem[] = [];
  medications: Medication[] = [];
  pharmacies: Pharmacy[] = [];
  editingItem: StockItem | null = null;
  searchTerm: string = '';

  sortField: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  // ✅ Map pour stocker le stock disponible non expiré par item
  availableStockMap: Map<number, number> = new Map();

  // ✅ Map pour les quantités à consommer (une par ligne)
  consumeQuantities: { [itemId: number]: number } = {};

  // ✅ Popup state
  popupMessage: string = '';
  popupType: 'error' | 'success' = 'error';
  showPopup: boolean = false;
  private popupTimer: any;

  newStockItem: StockItem = {
    pharmacyId: 1,
    medicationId: 0,
    medication: { id: 0, name: '', dosage: '' },
    totalQuantity: 0,
    reservedQuantity: 0,
    lowStockThreshold: 5,
    status: 'AVAILABLE'
  };

  constructor(
    private stockItemService: StockItemService,
    private medicationService: MedicationService,
    private pharmacyService: PharmacyService,
    private stockBatchService: StockBatchService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadLookups();
  }

  ngOnDestroy(): void {
    if (this.popupTimer) clearTimeout(this.popupTimer);
  }

  // ✅ Affiche une popup (error ou success) avec auto-dismiss après 4s
  showNotification(message: string, type: 'error' | 'success' = 'error'): void {
    if (this.popupTimer) clearTimeout(this.popupTimer);
    this.popupMessage = message;
    this.popupType = type;
    this.showPopup = true;
    this.popupTimer = setTimeout(() => this.closePopup(), 4000);
  }

  closePopup(): void {
    this.showPopup = false;
    this.popupMessage = '';
  }

  loadLookups(): void {
    this.pharmacyService.getAll().subscribe({
      next: pharmacies => {
        this.pharmacies = pharmacies;
        const selectedExists = this.pharmacies.some(p => p.id === this.newStockItem.pharmacyId);
        if (this.pharmacies.length > 0 && !selectedExists) {
          this.newStockItem.pharmacyId = this.pharmacies[0].id ?? 1;
        }
        this.loadMedications();
      },
      error: () => this.showNotification('Error loading pharmacies')
    });
  }

  loadMedications(): void {
    this.medicationService.getAll().subscribe({
      next: meds => {
        this.medications = meds.filter(m => m.id > 0);
        this.loadStockItems();
      },
      error: () => this.showNotification('Error loading medications')
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

        this.stockItems.forEach(item => {
          if (item.id !== undefined) {
            this.loadAvailableStock(item.id);
          }
        });
      },
      error: () => this.showNotification('Error loading stock items')
    });
  }

  loadAvailableStock(stockItemId: number): void {
    this.stockBatchService.getBatchesByStockItem(stockItemId).subscribe({
      next: (batches: StockBatch[]) => {
        const today = new Date();
        const available = batches
          .filter(b => b.expirationDate && new Date(b.expirationDate) >= today)
          .reduce((sum, b) => sum + b.remainingQuantity, 0);
        this.availableStockMap.set(stockItemId, available);
      },
      error: () => this.availableStockMap.set(stockItemId, 0)
    });
  }

  getAvailableStock(item: StockItem): number {
    if (item.id === undefined) return 0;
    return (this.availableStockMap.get(item.id) ?? item.totalQuantity) - item.reservedQuantity;
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
    if (!this.newStockItem.pharmacyId || this.newStockItem.pharmacyId <= 0) {
      this.showNotification('Please select a pharmacy');
      return;
    }
    if (!this.newStockItem.medicationId || this.newStockItem.medicationId === 0) {
      this.showNotification('Please select a medication');
      return;
    }
    const selectedMed = this.medications.find(m => m.id === this.newStockItem.medicationId);
    if (!selectedMed) {
      this.showNotification('Invalid medication');
      return;
    }
    const duplicateExists = this.stockItems.some(
      item =>
        item.pharmacyId === this.newStockItem.pharmacyId &&
        item.medicationId === this.newStockItem.medicationId
    );
    if (duplicateExists) {
      this.showNotification('Stock item already exists for this pharmacy and medication');
      return;
    }
    const stockToCreate = { ...this.newStockItem, medication: selectedMed };
    this.stockItemService.create(stockToCreate).subscribe({
      next: () => {
        this.loadStockItems();
        this.newStockItem = {
          pharmacyId: this.newStockItem.pharmacyId,
          medicationId: 0,
          medication: { id: 0, name: '', dosage: '' },
          totalQuantity: 0,
          reservedQuantity: 0,
          lowStockThreshold: 5,
          status: 'AVAILABLE'
        };
        this.showNotification('Stock item created successfully', 'success');
      },
      error: (err) => {
        const backendMessage =
          err?.error?.message ||
          err?.error?.error ||
          (typeof err?.error === 'string' ? err.error : null);
        this.showNotification(backendMessage ? `Error: ${backendMessage}` : 'Error creating stock item');
      }
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
    this.stockItemService.update(this.editingItem.id, this.editingItem.lowStockThreshold).subscribe({
      next: () => {
        this.loadStockItems();
        this.editingItem = null;
        this.showNotification('Stock item updated successfully', 'success');
      },
      error: () => this.showNotification('Unable to update this stock item')
    });
  }

  deleteItem(item: StockItem): void {
    if (item.id === undefined) return;
    if (confirm(`Delete stock item for ${item.medication?.name}?`)) {
      this.stockItemService.delete(item.id).subscribe({
        next: () => {
          this.loadStockItems();
          this.showNotification('Stock item deleted successfully', 'success');
        },
        error: () => this.showNotification('Unable to delete this stock item')
      });
    }
  }

  consumeStock(item: StockItem, quantity: number): void {
    if (item.id === undefined || !quantity || quantity <= 0) {
      this.showNotification('Please enter a valid quantity');
      return;
    }
    const available = this.getAvailableStock(item);
    if (quantity > available) {
      this.showNotification(
        `Insufficient stock for "${item.medication?.name}": only ${available} unit(s) available (non-expired)`
      );
      return;
    }
    this.stockItemService.consume(item.id, quantity, `Manual consumption - ${item.medication?.name}`).subscribe({
      next: () => {
        // ✅ Reset la quantité après consommation réussie
        if (item.id !== undefined) {
          this.consumeQuantities[item.id] = 0;
        }
        this.loadStockItems();
        this.showNotification(`${quantity} unit(s) consumed from "${item.medication?.name}"`, 'success');
      },
      error: (err) => {
        const backendMessage = err?.error?.message || err?.error || null;
        this.showNotification(
          backendMessage
            ? `Error: ${backendMessage}`
            : `Error consuming stock for "${item.medication?.name}"`
        );
      }
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
