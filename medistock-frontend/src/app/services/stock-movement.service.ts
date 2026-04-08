import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StockMovement } from '../models/stock-movement.model';

@Injectable({ providedIn: 'root' })
export class StockMovementService {
  private baseUrl = 'http://localhost:8090/stock/api/stock/movements';

  constructor(private http: HttpClient) {}

  getByStockItem(stockItemId: number): Observable<StockMovement[]> {
    return this.http.get<StockMovement[]>(`${this.baseUrl}/${stockItemId}`);
  }
}