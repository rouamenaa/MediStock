export interface StockMovement {
  id?: number;
  stockItemId: number;
  type: string; 
  quantityChanged: number;
  timestamp?: string;
  reference: string;
}