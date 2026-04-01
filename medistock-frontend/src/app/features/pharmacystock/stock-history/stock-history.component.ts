import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { StockMovementService } from '../../../services/stock-movement.service';
import { StockMovement } from '../../../models/stock-movement.model';

import {
  trigger,
  transition,
  style,
  animate,
  query,
  stagger
} from '@angular/animations';

@Component({
  selector: 'app-stock-history',
  templateUrl: './stock-history.component.html',
  styleUrls: ['./stock-history.component.css'],
  animations: [

    // 🔥 Timeline stagger animation
    trigger('listAnimation', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(20px)' }),
          stagger(80, [
            animate('400ms cubic-bezier(0.25, 0.8, 0.25, 1)',
              style({ opacity: 1, transform: 'translateY(0)' })
            )
          ])
        ], { optional: true })
      ])
    ]),

    // 🔥 Fade in (stats + sections)
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(15px)' }),
        animate('400ms ease-out',
          style({ opacity: 1, transform: 'translateY(0)' })
        )
      ])
    ]),

    // 🔥 Filter switch animation
    trigger('filterSwitch', [
      transition('* => *', [
        style({ opacity: 0.7, transform: 'scale(0.98)' }),
        animate('200ms ease-out',
          style({ opacity: 1, transform: 'scale(1)' })
        )
      ])
    ]),

    // 🔥 Empty state animation
    trigger('emptyState', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.95)' }),
        animate('300ms ease-out',
          style({ opacity: 1, transform: 'scale(1)' })
        )
      ])
    ])

  ]
})
export class StockHistoryComponent implements OnInit {

  stockItemId!: number;
  movements: StockMovement[] = [];
  filteredMovements: StockMovement[] = [];
  errorMessage: string = '';

  activeFilter: 'ALL' | 'ADD' | 'REMOVE' | 'CONSUME' | 'EXPIRED' = 'ALL';

  constructor(
    private movementService: StockMovementService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.stockItemId = +this.route.snapshot.params['stockItemId'];
    this.loadHistory();
  }

  loadHistory(): void {
    this.movementService.getByStockItem(this.stockItemId).subscribe({
      next: data => {
        this.movements = data.sort((a, b) => {
          const dateA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
          const dateB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
          return dateB - dateA;
        });
        this.applyFilter('ALL');
      },
      error: () => this.errorMessage = 'Error loading history'
    });
  }

  applyFilter(type: 'ALL' | 'ADD' | 'REMOVE' | 'CONSUME' | 'EXPIRED'): void {
    this.activeFilter = type;
    this.filteredMovements = type === 'ALL'
      ? this.movements
      : this.movements.filter(m => m.type === type);
  }

  getIcon(type: string): string {
    switch (type) {
      case 'ADD': return '＋';
      case 'REMOVE': return '－';
      case 'CONSUME': return '◎';
      case 'EXPIRED': return '⚠';
      default: return '●';
    }
  }

  getTypeClass(type: string): string {
    return `type-${type.toLowerCase()}`;
  }

  getQuantityDisplay(move: StockMovement): string {
    const sign = move.type === 'ADD' ? '+' : '-';
    return `${sign}${move.quantityChanged}`;
  }
  // ✅ Stats
get totalAdded(): number {
  return this.movements
    .filter(m => m.type === 'ADD')
    .reduce((sum, m) => sum + m.quantityChanged, 0);
}

get totalConsumed(): number {
  return this.movements
    .filter(m => m.type === 'CONSUME' || m.type === 'REMOVE')
    .reduce((sum, m) => sum + m.quantityChanged, 0);
}

get totalExpired(): number {
  return this.movements
    .filter(m => m.type === 'EXPIRED')
    .reduce((sum, m) => sum + m.quantityChanged, 0);
}

get netBalance(): number {
  return this.totalAdded - this.totalConsumed - this.totalExpired;
}
}