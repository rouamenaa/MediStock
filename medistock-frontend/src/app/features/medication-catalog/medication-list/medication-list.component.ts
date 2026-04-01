import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CatalogApiService } from '../../../services/catalog-api.service';
import { MedicationCatalog } from '../../../models/catalog-medication.model';
import { CatalogActivePrinciple } from '../../../models/catalog-active-principle.model';

@Component({
  selector: 'app-medication-list',
  templateUrl: './medication-list.component.html',
  styleUrls: ['../catalog-shared.css', './medication-list.component.css']
})
export class MedicationListComponent implements OnInit {

  medications: MedicationCatalog[] = [];
  principles: CatalogActivePrinciple[] = [];
  searchName = '';
  searchDci = '';
  errorMessage = '';
  successMessage = '';
  medicationPendingDelete: MedicationCatalog | null = null;
  /** Formulaire d’ajout masqué jusqu’au clic sur Ajouter */
  addSectionOpen = false;

  newMed: MedicationCatalog = {
    name: '',
    form: '',
    dosage: '',
    activePrincipleId: 0,
    laboratory: '',
    productCode: '',
    active: true,
    categoryIds: []
  };

  constructor(
    private catalog: CatalogApiService,
    private router: Router
  ) {}

  get medicationDeleteMessage(): string {
    const m = this.medicationPendingDelete;
    if (!m) return '';
    return `Supprimer définitivement « ${m.name} » du catalogue ? Les liens génériques vers ce médicament comme référence seront retirés.`;
  }

  openAddSection(): void {
    this.addSectionOpen = true;
  }

  closeAddSection(): void {
    this.addSectionOpen = false;
  }

  ngOnInit(): void {
    this.loadPrinciples();
    this.loadMedications();
  }

  loadPrinciples(): void {
    this.catalog.listActivePrinciples().subscribe({
      next: p => this.principles = p,
      error: () => this.errorMessage = 'Impossible de charger les principes actifs'
    });
  }

  loadMedications(): void {
    this.errorMessage = '';
    const name = this.searchName.trim() || undefined;
    this.catalog.listMedications(name).subscribe({
      next: m => this.medications = m,
      error: () => this.errorMessage = 'Impossible de charger les médicaments'
    });
  }

  searchByDci(): void {
    this.errorMessage = '';
    const q = this.searchDci.trim() || undefined;
    this.catalog.searchMedicationsByActivePrinciple(q).subscribe({
      next: m => this.medications = m,
      error: () => this.errorMessage = 'Recherche par principe actif impossible'
    });
  }

  resetSearch(): void {
    this.searchName = '';
    this.searchDci = '';
    this.loadMedications();
  }

  addMedication(): void {
    this.successMessage = '';
    if (!this.newMed.name.trim()) {
      this.errorMessage = 'Le nom est obligatoire';
      return;
    }
    if (!this.newMed.activePrincipleId) {
      this.errorMessage = 'Sélectionnez un principe actif';
      return;
    }
    const body: MedicationCatalog = {
      ...this.newMed,
      categoryIds: this.newMed.categoryIds?.length ? this.newMed.categoryIds : undefined
    };
    this.catalog.createMedication(body).subscribe({
      next: () => {
        this.successMessage = 'Médicament créé';
        this.addSectionOpen = false;
        this.newMed = {
          name: '',
          form: '',
          dosage: '',
          activePrincipleId: 0,
          laboratory: '',
          productCode: '',
          active: true,
          categoryIds: []
        };
        this.loadMedications();
      },
      error: () => this.errorMessage = 'Création impossible (vérifiez les données et le serveur)'
    });
  }

  openDetail(id: number | undefined): void {
    if (id != null) {
      this.router.navigate(['/catalog/medications', id]);
    }
  }

  requestDeleteMedication(m: MedicationCatalog): void {
    if (m.id == null) return;
    this.medicationPendingDelete = m;
  }

  cancelDeleteMedication(): void {
    this.medicationPendingDelete = null;
  }

  executeDeleteMedication(): void {
    const m = this.medicationPendingDelete;
    if (m?.id == null) return;
    this.errorMessage = '';
    this.successMessage = '';
    this.catalog.deleteMedication(m.id).subscribe({
      next: () => {
        this.medicationPendingDelete = null;
        this.successMessage = 'Médicament supprimé';
        if (this.searchDci.trim()) {
          this.searchByDci();
        } else {
          this.loadMedications();
        }
      },
      error: (err) => {
        this.medicationPendingDelete = null;
        const msg = (err as { error?: { error?: string } }).error?.error;
        this.errorMessage = msg ?? 'Suppression impossible';
      }
    });
  }
}
