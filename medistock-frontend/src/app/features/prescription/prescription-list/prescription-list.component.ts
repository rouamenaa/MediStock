import { Component, OnInit } from '@angular/core';
import { Prescription, PrescriptionStatus } from '../../../models/prescription.model';
import { PrescriptionService } from '../../../services/prescription.service';

@Component({
  selector: 'app-prescription-list',
  templateUrl: './prescription-list.component.html',
  styleUrls: ['./prescription-list.component.css']
})
export class PrescriptionListComponent implements OnInit {

  prescriptions: Prescription[] = [];
  filteredPrescriptions: Prescription[] = [];
  loading = false;
  errorMessage = '';
  successMessage = '';
  searchTerm = '';
  selectedStatus = '';

  prescriptionStatuses = Object.values(PrescriptionStatus);
  PrescriptionStatus = PrescriptionStatus;

  constructor(private prescriptionService: PrescriptionService) {}

  ngOnInit(): void {
    this.loadPrescriptions();
  }

  loadPrescriptions(): void {
    this.loading = true;
    this.prescriptionService.getAllPrescriptions().subscribe({
      next: (data) => {
        this.prescriptions = data;
        this.filteredPrescriptions = data;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Erreur lors du chargement des prescriptions.';
        this.loading = false;
      }
    });
  }

  filterPrescriptions(): void {
    this.filteredPrescriptions = this.prescriptions.filter(p => {
      const matchSearch = !this.searchTerm ||
        p.patientName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        p.doctorName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        p.prescriptionNumber?.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchStatus = !this.selectedStatus || p.status === this.selectedStatus;
      return matchSearch && matchStatus;
    });
  }

  validate(p: Prescription, status: PrescriptionStatus): void {
    this.prescriptionService.validatePrescription(p.id!, status, 'admin').subscribe({
      next: (updated) => {
        const i = this.prescriptions.findIndex(x => x.id === updated.id);
        if (i !== -1) this.prescriptions[i] = updated;
        this.filterPrescriptions();
        this.successMessage = status === PrescriptionStatus.VALID
          ? 'Prescription validée.' : 'Prescription rejetée.';
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: () => this.errorMessage = 'Erreur lors de la validation.'
    });
  }

  cancel(p: Prescription): void {
    if (!confirm(`Annuler la prescription ${p.prescriptionNumber} ?`)) return;
    this.prescriptionService.cancelPrescription(p.id!).subscribe({
      next: (updated) => {
        const i = this.prescriptions.findIndex(x => x.id === updated.id);
        if (i !== -1) this.prescriptions[i] = updated;
        this.filterPrescriptions();
        this.successMessage = 'Prescription annulée.';
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: () => this.errorMessage = "Erreur lors de l'annulation."
    });
  }

  delete(id: number): void {
    if (!confirm('Supprimer cette prescription ?')) return;
    this.prescriptionService.deletePrescription(id).subscribe({
      next: () => {
        this.prescriptions = this.prescriptions.filter(p => p.id !== id);
        this.filterPrescriptions();
        this.successMessage = 'Prescription supprimée.';
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: () => this.errorMessage = 'Erreur lors de la suppression.'
    });
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      PENDING_VALIDATION: 'badge-warning',
      VALID:   'badge-success',
      EXPIRED: 'badge-secondary',
      USED:    'badge-info',
      REJECTED:'badge-danger',
      CANCELLED:'badge-dark'
    };
    return map[status] || 'badge-secondary';
  }

  isExpired(p: Prescription): boolean {
    return !!p.expiryDate && new Date(p.expiryDate) < new Date();
  }
}