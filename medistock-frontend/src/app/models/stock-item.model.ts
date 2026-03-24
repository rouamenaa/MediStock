import { Medication } from "./medication.model";

export interface StockItem {
  id?: number;
  pharmacyId: number;
  medicationId: number; // <-- ajouter si ce n'est pas déjà là
  medication: Medication; // objet complet pour affichage
  totalQuantity: number;
  reservedQuantity: number;
  lowStockThreshold: number;
  status: string;
}