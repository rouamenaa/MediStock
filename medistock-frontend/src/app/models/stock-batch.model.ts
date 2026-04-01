import { StockItem } from './stock-item.model';

export interface StockBatch {
  id?: number;
  stockItem?: StockItem;
  batchNumber: string;
  expirationDate: string;
  initialQuantity: number;
  remainingQuantity: number;
  createdAt?: string;
}