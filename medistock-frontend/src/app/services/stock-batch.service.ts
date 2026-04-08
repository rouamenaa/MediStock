import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StockBatch } from '../models/stock-batch.model';

@Injectable({ providedIn: 'root' })
export class StockBatchService {
  private baseUrl = 'http://localhost:8090/stock/api/stockitems';

  constructor(private http: HttpClient) {}

  getAll(stockItemId: number): Observable<StockBatch[]> {
    return this.http.get<StockBatch[]>(`${this.baseUrl}/${stockItemId}/batches`);
  }

  create(stockItemId: number, batch: StockBatch): Observable<StockBatch> {
    return this.http.post<StockBatch>(`${this.baseUrl}/${stockItemId}/batches`, batch);
  }
  getBatchesByStockItem(stockItemId: number): Observable<StockBatch[]> {
    return this.http.get<StockBatch[]>(`${this.baseUrl}/${stockItemId}/batches`);
  }

 update(stockItemId: number, batchId: number, batch: StockBatch): Observable<StockBatch> {
  return this.http.put<StockBatch>(
    `${this.baseUrl}/${stockItemId}/batches/${batchId}`,
    batch
  );
}

  delete(stockItemId: number, batchId: number): Observable<void> {
  return this.http.delete<void>(`${this.baseUrl}/${stockItemId}/batches/${batchId}`);
}
}