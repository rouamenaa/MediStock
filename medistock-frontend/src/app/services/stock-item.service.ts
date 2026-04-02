import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StockItem } from '../models/stock-item.model';

@Injectable({ providedIn: 'root' })
export class StockItemService {
  private baseUrl = 'http://localhost:8081/api/stockitems';

  constructor(private http: HttpClient) {}

  getAll(): Observable<StockItem[]> {
    return this.http.get<StockItem[]>(this.baseUrl);
  }

  get(id: number): Observable<StockItem> {
    return this.http.get<StockItem>(`${this.baseUrl}/${id}`);
  }

  create(item: StockItem): Observable<StockItem> {
    return this.http.post<StockItem>(this.baseUrl, item);
  }

  update(id: number, lowStockThreshold: number): Observable<StockItem> {
    return this.http.put<StockItem>(`${this.baseUrl}/${id}?lowStockThreshold=${lowStockThreshold}`, {});
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  consume(id: number, quantity: number, reference: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${id}/consume?quantity=${quantity}&reference=${reference}`, {});
  }
}