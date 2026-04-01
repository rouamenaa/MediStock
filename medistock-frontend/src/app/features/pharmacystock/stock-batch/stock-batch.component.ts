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

  // ✅ Vérifie si une date string est expirée
  isDateExpired(dateStr: string): boolean {
    if (!dateStr) return false;
    return new Date(dateStr) < new Date();
  }

  addBatch(): void {
    if (!this.newBatch.batchNumber || !this.newBatch.expirationDate || this.newBatch.initialQuantity <= 0) {
      this.errorMessage = 'Veuillez remplir tous les champs';
      return;
    }

    // ✅ Bloquer si la date est expirée
    if (this.isDateExpired(this.newBatch.expirationDate)) {
      this.errorMessage = 'Impossible d\'ajouter un batch déjà expiré';
      return;
    }

    this.newBatch.remainingQuantity = this.newBatch.initialQuantity;
    this.batchService.create(this.stockItemId, this.newBatch).subscribe({
      next: () => {
        this.loadBatches();
        this.newBatch = { batchNumber: '', expirationDate: '', initialQuantity: 0, remainingQuantity: 0 };
        this.errorMessage = '';
      },
      error: () => this.errorMessage = 'Erreur ajout batch'
    });
  }

  startEdit(batch: StockBatch): void {
    // ✅ Bloquer l'édition d'un batch expiré
    if (this.isExpired(batch)) {
      this.errorMessage = 'Impossible de modifier un batch expiré';
      return;
    }
    this.errorMessage = '';
    this.editBatch = { ...batch };
  }

  cancelEdit(): void {
    this.editBatch = null;
    this.errorMessage = '';
  }

  updateBatch(): void {
    if (!this.editBatch || !this.editBatch.id) return;

    // ✅ Bloquer si la nouvelle date est expirée
    if (this.isDateExpired(this.editBatch.expirationDate)) {
      this.errorMessage = 'La date d\'expiration ne peut pas être dans le passé';
      return;
    }

    // ✅ Récupérer le batch original pour comparer
    const originalBatch = this.batches.find(b => b.id === this.editBatch!.id);
    if (originalBatch) {
      const consumed = originalBatch.initialQuantity - originalBatch.remainingQuantity;
      const newRemaining = this.editBatch.initialQuantity - consumed;

      if (newRemaining < 0) {
        this.errorMessage = `Quantité invalide : ${consumed} unité(s) ont déjà été consommées, il en reste ${originalBatch.remainingQuantity} à utiliser`;
        return;
      }

      this.editBatch.remainingQuantity = newRemaining;
    } else {
      this.editBatch.remainingQuantity = this.editBatch.initialQuantity;
    }

    this.batchService.update(this.stockItemId, this.editBatch.id!, this.editBatch).subscribe({
      next: () => {
        this.loadBatches();
        this.editBatch = null;
        this.errorMessage = '';
      },
      error: () => this.errorMessage = 'Erreur mise à jour batch'
    });
  }

  deleteBatch(batch: StockBatch): void {
    if (confirm(`Supprimer batch ${batch.batchNumber}?`)) {
      this.batchService.delete(this.stockItemId, batch.id!).subscribe({
        next: () => this.loadBatches(),
        error: () => this.errorMessage = 'Erreur suppression batch'
      });
    }
  }

  // ✅ Retourne le nombre d'unités déjà consommées pour un batch
  getBatchConsumed(batch: StockBatch): number {
    const original = this.batches.find(b => b.id === batch.id);
    if (!original) return 0;
    return original.initialQuantity - original.remainingQuantity;
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