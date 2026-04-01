import { Medication } from "./medication.model";


export interface StockItem {
  id?: number;
  pharmacyId: number;
  medicationId?: number;   // pour compatibilité si nécessaire
  medication: Medication; // ← ajoute ce champ
  totalQuantity: number;
  reservedQuantity: number;
  lowStockThreshold: number;
  status: string;
  lastUpdated?: string;
}