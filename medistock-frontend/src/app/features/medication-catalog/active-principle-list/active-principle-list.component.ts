import { Component, OnInit } from '@angular/core';
import { CatalogApiService } from '../../../services/catalog-api.service';
import { CatalogActivePrinciple } from '../../../models/catalog-active-principle.model';

@Component({
  selector: 'app-active-principle-list',
  templateUrl: './active-principle-list.component.html',
  styleUrls: ['../catalog-shared.css', './active-principle-list.component.css']
})
export class ActivePrincipleListComponent implements OnInit {

  principles: CatalogActivePrinciple[] = [];
  search = '';
  editing: CatalogActivePrinciple | null = null;
  draft: CatalogActivePrinciple = { code: '', name: '', description: '' };
  errorMessage = '';
  successMessage = '';
  principlePendingDelete: CatalogActivePrinciple | null = null;
  addSectionOpen = false;

  constructor(private catalog: CatalogApiService) {}

  openAddSection(): void {
    this.addSectionOpen = true;
  }

  closeAddSection(): void {
    this.addSectionOpen = false;
  }

  get principleDeleteMessage(): string {
    const p = this.principlePendingDelete;
    if (!p) return '';
    return `Vous allez supprimer le principe actif « ${p.name} » (${p.code}). Cette action est impossible si des médicaments l’utilisent encore.`;
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    const s = this.search.trim() || undefined;
    this.catalog.listActivePrinciples(s).subscribe({
      next: p => this.principles = p,
      error: () => this.errorMessage = 'Chargement impossible'
    });
  }

  create(): void {
    this.errorMessage = '';
    this.successMessage = '';
    if (!this.draft.code.trim() || !this.draft.name.trim()) {
      this.errorMessage = 'Code et nom sont obligatoires';
      return;
    }
    this.catalog.createActivePrinciple({
      code: this.draft.code.trim(),
      name: this.draft.name.trim(),
      description: this.draft.description?.trim() || undefined
    }).subscribe({
      next: () => {
        this.addSectionOpen = false;
        this.draft = { code: '', name: '', description: '' };
        this.successMessage = 'Principe actif créé';
        this.load();
      },
      error: () => this.errorMessage = 'Création impossible'
    });
  }

  startEdit(p: CatalogActivePrinciple): void {
    this.editing = { ...p };
  }

  cancelEdit(): void {
    this.editing = null;
  }

  saveEdit(): void {
    if (!this.editing?.id || !this.editing.code.trim() || !this.editing.name.trim()) return;
    this.catalog.updateActivePrinciple(this.editing.id, {
      code: this.editing.code.trim(),
      name: this.editing.name.trim(),
      description: this.editing.description?.trim() || undefined
    }).subscribe({
      next: () => {
        this.editing = null;
        this.successMessage = 'Mis à jour';
        this.load();
      },
      error: () => this.errorMessage = 'Mise à jour impossible'
    });
  }

  requestDeletePrinciple(p: CatalogActivePrinciple): void {
    if (p.id == null) return;
    this.principlePendingDelete = p;
  }

  cancelDeletePrinciple(): void {
    this.principlePendingDelete = null;
  }

  executeDeletePrinciple(): void {
    const p = this.principlePendingDelete;
    if (p?.id == null) return;
    this.errorMessage = '';
    this.successMessage = '';
    this.catalog.deleteActivePrinciple(p.id).subscribe({
      next: () => {
        this.principlePendingDelete = null;
        if (this.editing?.id === p.id) {
          this.editing = null;
        }
        this.successMessage = 'Principe actif supprimé';
        this.load();
      },
      error: (err) => {
        this.principlePendingDelete = null;
        const msg = (err as { error?: { error?: string } }).error?.error;
        this.errorMessage = msg ?? 'Suppression impossible';
      }
    });
  }
}
