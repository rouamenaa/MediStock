import { Component, OnInit } from '@angular/core';
import { DocumentCatalog, DocumentService } from '../services/document.service';

@Component({
  selector: 'app-document-upload',
  templateUrl: './document-upload.component.html',
  styleUrls: ['./document-upload.component.css']
})
export class DocumentUploadComponent implements OnInit {
  selectedFile: File | null = null;
  referenceId = '';
  selectedCatalogKey = '';
  documentType = '';
  catalogs: DocumentCatalog[] = [];
  loadingCatalogs = false;
  loading = false;
  successMessage = '';
  errorMessage = '';

  constructor(private readonly documentService: DocumentService) {}

  ngOnInit(): void {
    this.loadCatalogs();
  }

  get selectedCatalog(): DocumentCatalog | undefined {
    return this.catalogs.find((catalog) => catalog.key === this.selectedCatalogKey);
  }

  get availableDocumentTypes(): string[] {
    return this.selectedCatalog?.allowedDocumentTypes || [];
  }

  loadCatalogs(): void {
    this.loadingCatalogs = true;
    this.documentService.catalogs().subscribe({
      next: (catalogs) => {
        this.catalogs = catalogs;
        if (catalogs.length > 0) {
          this.selectedCatalogKey = catalogs[0].key;
          this.documentType = catalogs[0].allowedDocumentTypes[0] || '';
        }
        this.loadingCatalogs = false;
      },
      error: () => {
        this.loadingCatalogs = false;
        this.errorMessage = 'Impossible de charger les catalogues.';
      }
    });
  }

  onCatalogChange(): void {
    const catalog = this.selectedCatalog;
    if (!catalog) {
      return;
    }
    this.documentType = catalog.allowedDocumentTypes[0] || '';
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files && input.files.length > 0 ? input.files[0] : null;
  }

  upload(): void {
    this.successMessage = '';
    this.errorMessage = '';

    if (!this.selectedFile) {
      this.errorMessage = 'Veuillez sélectionner un fichier.';
      return;
    }

    if (!this.referenceId.trim()) {
      this.errorMessage = 'Référence métier obligatoire.';
      return;
    }

    if (!this.selectedCatalogKey) {
      this.errorMessage = 'Catalogue obligatoire.';
      return;
    }

    this.loading = true;

    this.documentService
      .uploadToCatalog({
        catalogKey: this.selectedCatalogKey,
        file: this.selectedFile,
        referenceId: this.referenceId,
        documentType: this.documentType
      })
      .subscribe({
        next: () => {
          this.loading = false;
          this.successMessage = 'Document catalogué avec succès.';
          this.selectedFile = null;
        },
        error: (error) => {
          this.loading = false;
          this.errorMessage = error?.error?.message || 'Erreur lors de l’upload.';
        }
      });
  }
}
