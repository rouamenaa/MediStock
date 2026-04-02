import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CatalogApiService } from '../../../services/catalog-api.service';
import { MedicationCatalog } from '../../../models/catalog-medication.model';
import { CatalogCategory } from '../../../models/catalog-category.model';
import { CatalogActivePrinciple } from '../../../models/catalog-active-principle.model';

@Component({
  selector: 'app-medication-detail',
  templateUrl: './medication-detail.component.html',
  styleUrls: ['../catalog-shared.css', './medication-detail.component.css']
})
export class MedicationDetailComponent implements OnInit {

  medId!: number;
  form!: MedicationCatalog;
  categories: CatalogCategory[] = [];
  principles: CatalogActivePrinciple[] = [];
  selectedCategoryIds = new Set<number>();
  generics: MedicationCatalog[] = [];
  newGenericId: number | null = null;
  errorMessage = '';
  successMessage = '';
  genericPendingRemove: MedicationCatalog | null = null;
  /** Formulaire « Modifier » masqué jusqu’au clic sur Mettre à jour */
  editSectionOpen = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private catalog: CatalogApiService
  ) {}

  get genericRemoveMessage(): string {
    const g = this.genericPendingRemove;
    if (!g) return '';
    return `Retirer le lien générique pour « ${g.name} » ? Le médicament ne sera plus associé à cette référence.`;
  }

  openEditSection(): void {
    this.editSectionOpen = true;
  }

  closeEditSection(): void {
    this.editSectionOpen = false;
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? +idParam : NaN;
    if (Number.isNaN(id)) {
      this.router.navigate(['/catalog/medications']);
      return;
    }
    this.medId = id;
    this.catalog.listCategories().subscribe({
      next: c => this.categories = c,
      error: () => this.errorMessage = 'Catégories introuvables'
    });
    this.catalog.listActivePrinciples().subscribe({
      next: p => this.principles = p,
      error: () => { /* optional */ }
    });
    this.reload();
  }

  reload(): void {
    this.errorMessage = '';
    this.successMessage = '';
    this.catalog.getMedication(this.medId).subscribe({
      next: m => {
        this.form = { ...m, categoryIds: m.categoryIds ? [...m.categoryIds] : [] };
        this.selectedCategoryIds = new Set(this.form.categoryIds || []);
        this.loadGenerics();
      },
      error: () => {
        this.errorMessage = 'Médicament introuvable';
      }
    });
  }

  loadGenerics(): void {
    this.catalog.getGenericEquivalents(this.medId).subscribe({
      next: g => this.generics = g,
      error: () => this.generics = []
    });
  }

  toggleCategory(id: number): void {
    if (this.selectedCategoryIds.has(id)) {
      this.selectedCategoryIds.delete(id);
    } else {
      this.selectedCategoryIds.add(id);
    }
  }

  isCatChecked(id: number): boolean {
    return this.selectedCategoryIds.has(id);
  }

  save(): void {
    if (!this.form.name.trim()) {
      this.errorMessage = 'Le nom est obligatoire';
      return;
    }
    if (!this.form.activePrincipleId) {
      this.errorMessage = 'Principe actif requis';
      return;
    }
    const body: MedicationCatalog = {
      ...this.form,
      categoryIds: Array.from(this.selectedCategoryIds)
    };
    this.catalog.updateMedication(this.medId, body).subscribe({
      next: updated => {
        this.form = { ...updated, categoryIds: updated.categoryIds ? [...updated.categoryIds] : [] };
        this.selectedCategoryIds = new Set(this.form.categoryIds || []);
        this.successMessage = 'Enregistré';
        this.editSectionOpen = false;
        this.loadGenerics();
      },
      error: () => this.errorMessage = 'Mise à jour impossible'
    });
  }

  addGeneric(): void {
    if (this.newGenericId == null || this.newGenericId <= 0) {
      this.errorMessage = 'ID médicament générique invalide';
      return;
    }
    this.catalog.addGenericEquivalent(this.medId, this.newGenericId).subscribe({
      next: () => {
        this.newGenericId = null;
        this.successMessage = 'Générique associé';
        this.loadGenerics();
      },
      error: () => this.errorMessage = 'Association générique impossible'
    });
  }

  requestRemoveGeneric(g: MedicationCatalog): void {
    if (g.id == null) return;
    this.genericPendingRemove = g;
  }

  cancelRemoveGeneric(): void {
    this.genericPendingRemove = null;
  }

  executeRemoveGeneric(): void {
    const g = this.genericPendingRemove;
    if (g?.id == null) return;
    this.catalog.removeGenericEquivalent(g.id).subscribe({
      next: () => {
        this.genericPendingRemove = null;
        this.successMessage = 'Lien retiré';
        this.loadGenerics();
      },
      error: () => {
        this.genericPendingRemove = null;
        this.errorMessage = 'Suppression impossible';
      }
    });
  }
}
