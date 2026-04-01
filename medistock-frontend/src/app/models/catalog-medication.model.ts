export interface MedicationCatalog {
  id?: number;
  name: string;
  form?: string;
  dosage?: string;
  activePrincipleId: number;
  referenceMedicationId?: number | null;
  categoryIds?: number[];
  laboratory?: string;
  productCode?: string;
  active: boolean;
  activePrincipleName?: string;
  activePrincipleCode?: string;
  referenceMedicationName?: string | null;
}
