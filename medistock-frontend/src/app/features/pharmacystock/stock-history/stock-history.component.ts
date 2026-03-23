import { Component, OnInit } from '@angular/core';

import { ActivatedRoute } from '@angular/router';
import { StockMovementService } from '../../../services/stock-movement.service';
import { StockMovement } from '../../../models/stock-movement.model';

@Component({
  selector: 'app-stock-history',
  templateUrl: './stock-history.component.html',
  styleUrls: ['./stock-history.component.css']
})
export class StockHistoryComponent implements OnInit {
  stockItemId!: number;
  movements: StockMovement[] = [];
  errorMessage: string = '';

  constructor(private movementService: StockMovementService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.stockItemId = +this.route.snapshot.params['stockItemId'];
    this.loadHistory();
  }

  loadHistory(): void {
    this.movementService.getByStockItem(this.stockItemId).subscribe({
      next: data => this.movements = data,
      error: err => this.errorMessage = 'Erreur chargement historique'
    });
  }
}