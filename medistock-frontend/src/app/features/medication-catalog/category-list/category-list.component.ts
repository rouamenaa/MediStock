import { Component, OnInit } from '@angular/core';
import { CatalogApiService } from '../../../services/catalog-api.service';
import { CatalogCategory } from '../../../models/catalog-category.model';

@Component({
  selector: 'app-category-list',
  templateUrl: './category-list.component.html',
  styleUrls: ['../catalog-shared.css', './category-list.component.css']
})
export class CategoryListComponent implements OnInit {

  categories: CatalogCategory[] = [];
  editing: CatalogCategory | null = null;
  draft: CatalogCategory = { name: '', description: '' };
  errorMessage = '';
  successMessage = '';
  categoryPendingDelete: CatalogCategory | null = null;
  addSectionOpen = false;

  constructor(private catalog: CatalogApiService) {}

  openAddSection(): void {
    this.addSectionOpen = true;
  }

  closeAddSection(): void {
    this.addSectionOpen = false;
  }

  get categoryDeleteMessage(): string {
    const c = this.categoryPendingDelete;
    if (!c) return '';
    return `Vous allez supprimer la catégorie « ${c.name} ». Les liens avec les médicaments seront retirés.`;
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.catalog.listCategories().subscribe({
      next: c => this.categories = c,
      error: () => this.errorMessage = 'Chargement des catégories impossible'
    });
  }

  create(): void {
    this.errorMessage = '';
    this.successMessage = '';
    if (!this.draft.name.trim()) {
      this.errorMessage = 'Le nom est obligatoire';
      return;
    }
    this.catalog.createCategory({ name: this.draft.name.trim(), description: this.draft.description?.trim() || undefined }).subscribe({
      next: () => {
        this.addSectionOpen = false;
        this.draft = { name: '', description: '' };
        this.successMessage = 'Catégorie créée';
        this.load();
      },
      error: () => this.errorMessage = 'Création impossible'
    });
  }

  startEdit(c: CatalogCategory): void {
    this.editing = { ...c };
  }

  cancelEdit(): void {
    this.editing = null;
  }

  saveEdit(): void {
    if (!this.editing?.id || !this.editing.name.trim()) return;
    this.catalog.updateCategory(this.editing.id, {
      name: this.editing.name.trim(),
      description: this.editing.description?.trim() || undefined
    }).subscribe({
      next: () => {
        this.editing = null;
        this.successMessage = 'Catégorie mise à jour';
        this.load();
      },
      error: () => this.errorMessage = 'Mise à jour impossible'
    });
  }

  requestDeleteCategory(c: CatalogCategory): void {
    if (c.id == null) return;
    this.categoryPendingDelete = c;
  }

  cancelDeleteCategory(): void {
    this.categoryPendingDelete = null;
  }

  executeDeleteCategory(): void {
    const c = this.categoryPendingDelete;
    if (c?.id == null) return;
    this.errorMessage = '';
    this.successMessage = '';
    this.catalog.deleteCategory(c.id).subscribe({
      next: () => {
        this.categoryPendingDelete = null;
        if (this.editing?.id === c.id) {
          this.editing = null;
        }
        this.successMessage = 'Catégorie supprimée';
        this.load();
      },
      error: (err) => {
        this.categoryPendingDelete = null;
        const msg = (err as { error?: { error?: string } }).error?.error;
        this.errorMessage = msg ?? 'Suppression impossible';
      }
    });
  }
}
