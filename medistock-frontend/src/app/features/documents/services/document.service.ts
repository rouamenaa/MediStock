import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export type EntityType = 'USER' | 'ORDER' | 'MEDICATION' | 'STOCK' | 'PHARMACY';

export interface DocumentItem {
  id: number;
  filename: string;
  filepath: string;
  entityId: string;
  entityType: EntityType;
  documentType: string;
  sourceService: string;
  created_at: string;
  catalogKey: string | null;
  catalogTitle: string | null;
}

export interface DocumentMetricBucket {
  key: string;
  total: number;
}

export interface DocumentMetrics {
  totalDocuments: number;
  byCatalog: Array<{ key: string; title: string; total: number }>;
  byEntityType: DocumentMetricBucket[];
  byDocumentType: DocumentMetricBucket[];
  bySourceService: DocumentMetricBucket[];
  topEntities: Array<{ entityType: EntityType; entityId: string; totalDocuments: number }>;
}

export interface DocumentCatalog {
  key: string;
  title: string;
  sourceService: string;
  entityType: EntityType;
  allowedDocumentTypes: string[];
  totalDocuments: number;
}

export interface DocumentContext {
  entityId: string;
  entityType: EntityType;
  entitySnapshot: {
    available: boolean;
    status: number;
    data?: Record<string, unknown>;
  } | null;
  insights: {
    totalDocuments: number;
    documentTypes: Record<string, number>;
    sourceServices: Record<string, number>;
    missingDocuments: string[];
    lastUploadAt: string | null;
  };
  documents: DocumentItem[];
}

@Injectable({ providedIn: 'root' })
export class DocumentService {
  private readonly apiUrl = 'http://localhost:8091/documents';

  constructor(private readonly http: HttpClient) {}

  upload(payload: {
    file: File;
    entityId: string;
    entityType: EntityType;
    documentType: string;
    sourceService: string;
  }): Observable<DocumentItem> {
    const formData = new FormData();
    formData.append('file', payload.file);
    formData.append('entityId', payload.entityId);
    formData.append('entityType', payload.entityType);
    formData.append('documentType', payload.documentType);
    formData.append('sourceService', payload.sourceService);
    return this.http.post<DocumentItem>(`${this.apiUrl}/upload`, formData);
  }

  uploadToCatalog(payload: {
    catalogKey: string;
    file: File;
    referenceId: string;
    documentType: string;
  }): Observable<DocumentItem> {
    const formData = new FormData();
    formData.append('file', payload.file);
    formData.append('referenceId', payload.referenceId);
    formData.append('documentType', payload.documentType);
    return this.http.post<DocumentItem>(`${this.apiUrl}/catalogs/${payload.catalogKey}/upload`, formData);
  }

  list(entityId?: string, entityType?: EntityType | ''): Observable<DocumentItem[]> {
    let params = new HttpParams();

    if (entityId) {
      params = params.set('entityId', entityId);
    }

    if (entityType) {
      params = params.set('entityType', entityType);
    }

    return this.http.get<DocumentItem[]>(this.apiUrl, { params });
  }

  getById(id: number): Observable<DocumentItem> {
    return this.http.get<DocumentItem>(`${this.apiUrl}/${id}`);
  }

  downloadUrl(id: number): string {
    return `${this.apiUrl}/${id}/download`;
  }

  delete(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }

  metrics(): Observable<DocumentMetrics> {
    return this.http.get<DocumentMetrics>(`${this.apiUrl}/metrics`);
  }

  context(entityId: string, entityType: EntityType): Observable<DocumentContext> {
    const params = new HttpParams()
      .set('entityId', entityId)
      .set('entityType', entityType);
    return this.http.get<DocumentContext>(`${this.apiUrl}/context`, { params });
  }

  catalogs(): Observable<DocumentCatalog[]> {
    return this.http.get<DocumentCatalog[]>(`${this.apiUrl}/catalogs`);
  }

  listByCatalog(catalogKey: string, referenceId?: string): Observable<DocumentItem[]> {
    let params = new HttpParams();
    if (referenceId) {
      params = params.set('referenceId', referenceId);
    }
    return this.http.get<DocumentItem[]>(`${this.apiUrl}/catalogs/${catalogKey}/documents`, { params });
  }
}
