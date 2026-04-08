import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Prescription, PrescriptionStatus } from '../models/prescription.model';

@Injectable({
  providedIn: 'root'
})
export class PrescriptionService {

  private apiUrl = 'http://localhost:8090/orders/api/prescriptions';

  constructor(private http: HttpClient) {}

  getAllPrescriptions(): Observable<Prescription[]> {
    return this.http.get<Prescription[]>(this.apiUrl);
  }

  getPrescriptionById(id: number): Observable<Prescription> {
    return this.http.get<Prescription>(`${this.apiUrl}/${id}`);
  }

  getPrescriptionByNumber(number: string): Observable<Prescription> {
    return this.http.get<Prescription>(`${this.apiUrl}/number/${number}`);
  }

  getPrescriptionsByPatient(patientId: string): Observable<Prescription[]> {
    return this.http.get<Prescription[]>(`${this.apiUrl}/patient/${patientId}`);
  }

  getPrescriptionsByStatus(status: PrescriptionStatus): Observable<Prescription[]> {
    return this.http.get<Prescription[]>(`${this.apiUrl}/status/${status}`);
  }

  createPrescription(prescription: Prescription): Observable<Prescription> {
    return this.http.post<Prescription>(this.apiUrl, prescription);
  }

  validatePrescription(id: number, status: PrescriptionStatus, validatedBy?: string): Observable<Prescription> {
    let params = new HttpParams().set('status', status);
    if (validatedBy) params = params.set('validatedBy', validatedBy);
    return this.http.put<Prescription>(`${this.apiUrl}/${id}/validate`, null, { params });
  }

  cancelPrescription(id: number): Observable<Prescription> {
    return this.http.put<Prescription>(`${this.apiUrl}/${id}/cancel`, null);
  }

  deletePrescription(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}