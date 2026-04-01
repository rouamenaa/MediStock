import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Prescription } from '../../../models/prescription.model';
import { PrescriptionService } from '../../../services/prescription.service';

@Component({
  selector: 'app-prescription-form',
  templateUrl: './prescription-form.component.html',
  styleUrls: ['./prescription-form.component.css']
})
export class PrescriptionFormComponent {

  prescription: Prescription = {
    patientId: '',
    patientName: '',
    doctorName: '',
    doctorLicenseNumber: '',
    issueDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    diagnosis: '',
    notes: '',
    items: []
  };

  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(private prescriptionService: PrescriptionService, private router: Router) {
    this.addItem();
  }

  addItem(): void {
    this.prescription.items.push({
      medicationName: '',
      medicationCode: '',
      dosage: '',
      frequency: '',
      durationDays: 7,
      quantity: 1,
      instructions: ''
    });
  }

  removeItem(index: number): void {
    if (this.prescription.items.length > 1) {
      this.prescription.items.splice(index, 1);
    }
  }

  onSubmit(): void {
    if (!this.isFormValid()) return;
    this.loading = true;
    this.errorMessage = '';

    this.prescriptionService.createPrescription(this.prescription).subscribe({
      next: (created) => {
        this.successMessage = `Prescription ${created.prescriptionNumber} créée !`;
        this.loading = false;
        setTimeout(() => this.router.navigate(['/prescriptions']), 1500);
      },
      error: () => {
        this.errorMessage = 'Erreur lors de la création de la prescription.';
        this.loading = false;
      }
    });
  }

  isFormValid(): boolean {
    if (!this.prescription.patientId || !this.prescription.patientName
        || !this.prescription.doctorName || !this.prescription.issueDate) {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires.';
      return false;
    }
    if (this.prescription.items.some(i => !i.medicationName || !i.dosage || !i.frequency)) {
      this.errorMessage = 'Veuillez remplir correctement tous les médicaments.';
      return false;
    }
    return true;
  }

  trackByIndex(index: number): number { return index; }
}