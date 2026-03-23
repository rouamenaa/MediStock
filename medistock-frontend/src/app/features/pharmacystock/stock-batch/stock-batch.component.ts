import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { StockBatch } from '../../../models/stock-batch.model';
import { StockBatchService } from '../../../services/stock-batch.service';

@Component({
  selector: 'app-stock-batch',
  templateUrl: './stock-batch.component.html',
  styleUrls: ['./stock-batch.component.css']
})
export class StockBatchComponent implements OnInit {
  batches: StockBatch[] = [];
  stockItemId!: number;
  newBatch: StockBatch = { batchNumber: '', expirationDate: '', initialQuantity: 0, remainingQuantity: 0 };
  errorMessage: string = '';
  editBatch: StockBatch | null = null;

  constructor(private batchService: StockBatchService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.stockItemId = +this.route.snapshot.params['stockItemId'];
    this.loadBatches();
  }

  loadBatches(): void {
    if (!this.stockItemId) return;

    this.batchService.getBatchesByStockItem(this.stockItemId).subscribe({
  next: (batches: StockBatch[]) => {
    this.batches = batches.sort((a: StockBatch, b: StockBatch) =>
      new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime()
    );
  },
  error: () => this.errorMessage = 'Erreur chargement batches'
});
  }

  addBatch(): void {
    this.newBatch.remainingQuantity = this.newBatch.initialQuantity;
    this.batchService.create(this.stockItemId, this.newBatch).subscribe({
      next: () => {
        this.loadBatches();
        this.newBatch = { batchNumber: '', expirationDate: '', initialQuantity: 0, remainingQuantity: 0 };
      },
      error: () => this.errorMessage = 'Erreur ajout batch'
    });
  }

  startEdit(batch: StockBatch): void {
    this.editBatch = { ...batch };
  }

  cancelEdit(): void {
    this.editBatch = null;
  }

  updateBatch(): void {
    if (!this.editBatch || !this.editBatch.id) return;

    this.editBatch.remainingQuantity = this.editBatch.initialQuantity;

    this.batchService.update(this.stockItemId, this.editBatch.id, this.editBatch).subscribe({
      next: () => {
        this.loadBatches();
        this.editBatch = null;
      },
      error: () => this.errorMessage = 'Erreur mise à jour batch'
    });
  }

  deleteBatch(batch: StockBatch): void {
    if (confirm(`Supprimer batch ${batch.batchNumber}?`)) {
      this.batchService.delete(batch.id!).subscribe({
        next: () => this.loadBatches(),
        error: () => this.errorMessage = 'Erreur suppression batch'
      });
    }
  }

  // ✅ Vérifie si le batch est expiré
  isExpired(batch: StockBatch): boolean {
    return new Date(batch.expirationDate) < new Date();
  }

  // ✅ Vérifie si le batch expire dans moins de 7 jours
  isExpiringSoon(batch: StockBatch): boolean {
    const today = new Date();
    const expiration = new Date(batch.expirationDate);
    const diffDays = Math.ceil((expiration.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= 7;
  }
}