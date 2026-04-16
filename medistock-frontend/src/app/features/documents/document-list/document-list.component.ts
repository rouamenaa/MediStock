import { Component, OnInit } from '@angular/core';
import { DocumentCatalog, DocumentContext, DocumentItem, DocumentMetrics, DocumentService, EntityType } from '../services/document.service';

@Component({
  selector: 'app-document-list',
  templateUrl: './document-list.component.html',
  styleUrls: ['./document-list.component.css']
})
export class DocumentListComponent implements OnInit {
  documents: DocumentItem[] = [];
  loading = false;
  entityIdFilter = '';
  entityTypeFilter: EntityType | '' = '';
  selectedCatalogKey = '';
  errorMessage = '';
  successMessage = '';
  metricsLoading = false;
  contextLoading = false;
  catalogsLoading = false;
  metrics: DocumentMetrics | null = null;
  context: DocumentContext | null = null;
  catalogs: DocumentCatalog[] = [];
  readonly entityTypes: EntityType[] = ['USER', 'ORDER', 'MEDICATION', 'STOCK', 'PHARMACY'];

  constructor(private readonly documentService: DocumentService) {}

  ngOnInit(): void {
    this.loadCatalogs();
    this.loadMetrics();
    this.load();
  }

  load(): void {
    this.loading = true;
    this.errorMessage = '';
    const request = this.selectedCatalogKey
      ? this.documentService.listByCatalog(this.selectedCatalogKey, this.entityIdFilter || undefined)
      : this.documentService.list(this.entityIdFilter, this.entityTypeFilter);

    request.subscribe({
      next: (data) => {
        this.documents = data;
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error?.error?.message || 'Erreur chargement documents.';
      }
    });
  }

  loadCatalogs(): void {
    this.catalogsLoading = true;
    this.documentService.catalogs().subscribe({
      next: (data) => {
        this.catalogs = data;
        this.catalogsLoading = false;
      },
      error: () => {
        this.catalogsLoading = false;
      }
    });
  }

  loadMetrics(): void {
    this.metricsLoading = true;
    this.documentService.metrics().subscribe({
      next: (data) => {
        this.metrics = data;
        this.metricsLoading = false;
      },
      error: () => {
        this.metricsLoading = false;
      }
    });
  }

  clearFilters(): void {
    this.entityIdFilter = '';
    this.entityTypeFilter = '';
    this.selectedCatalogKey = '';
    this.load();
  }

  analyzeContext(): void {
    this.context = null;
    this.errorMessage = '';

    if (!this.entityIdFilter || !this.entityTypeFilter) {
      this.errorMessage = 'Pour l’analyse métier, renseignez entityId et entityType.';
      return;
    }

    this.contextLoading = true;
    this.documentService.context(this.entityIdFilter, this.entityTypeFilter).subscribe({
      next: (data) => {
        this.context = data;
        this.contextLoading = false;
      },
      error: (error) => {
        this.contextLoading = false;
        this.errorMessage = error?.error?.message || 'Analyse contextuelle indisponible.';
      }
    });
  }

  download(document: DocumentItem): void {
    window.open(this.documentService.downloadUrl(document.id), '_blank');
  }

  remove(document: DocumentItem): void {
    this.successMessage = '';
    this.errorMessage = '';

    if (!confirm(`Supprimer le document ${document.filename} ?`)) {
      return;
    }

    this.documentService.delete(document.id).subscribe({
      next: () => {
        this.successMessage = 'Document supprimé avec succès.';
        this.loadMetrics();
        this.load();
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Erreur suppression document.';
      }
    });
  }
}
