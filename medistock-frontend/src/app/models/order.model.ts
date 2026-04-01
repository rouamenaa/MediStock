export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PROCESSING = 'PROCESSING',
  READY = 'READY',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  REJECTED = 'REJECTED'
}

export interface OrderItem {
  id?: number;
  medicationId: number;
  medicationName: string;
  medicationCode?: string;
  quantity: number;
  unitPrice: number;
  totalPrice?: number;
  dosage?: string;
  instructions?: string;
}

export interface Order {
  id?: number;
  orderNumber?: string;
  patientId: string;
  patientName: string;
  pharmacyId: number;
  status?: OrderStatus;
  totalAmount?: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  items: OrderItem[];
}