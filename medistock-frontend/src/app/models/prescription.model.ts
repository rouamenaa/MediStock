export enum PrescriptionStatus {
  PENDING_VALIDATION = 'PENDING_VALIDATION',
  VALID = 'VALID',
  EXPIRED = 'EXPIRED',
  USED = 'USED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED'
}

export interface PrescriptionItem {
  id?: number;
  medicationName: string;
  medicationCode?: string;
  dosage: string;
  frequency: string;
  durationDays: number;
  quantity?: number;
  instructions?: string;
}

export interface Prescription {
  id?: number;
  prescriptionNumber?: string;
  patientId: string;
  patientName: string;
  doctorName: string;
  doctorLicenseNumber?: string;
  issueDate: string;
  expiryDate?: string;
  status?: PrescriptionStatus;
  diagnosis?: string;
  notes?: string;
  createdAt?: string;
  validatedAt?: string;
  validatedBy?: string;
  orderId?: number;
  items: PrescriptionItem[];
}