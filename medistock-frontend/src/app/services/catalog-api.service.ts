import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MedicationCatalog } from '../models/catalog-medication.model';
import { CatalogCategory } from '../models/catalog-category.model';
import { CatalogActivePrinciple } from '../models/catalog-active-principle.model';

const CATALOG_BASE = 'http://localhost:8090/api/catalog';

@Injectable({ providedIn: 'root' })
export class CatalogApiService {

  constructor(private http: HttpClient) {}

  /** GET /medications — optional name filter */
  listMedications(name?: string): Observable<MedicationCatalog[]> {
    let params = new HttpParams();
    if (name != null && name.trim() !== '') {
      params = params.set('name', name.trim());
    }
    return this.http.get<MedicationCatalog[]>(`${CATALOG_BASE}/medications`, { params });
  }

  searchMedicationsByActivePrinciple(q?: string): Observable<MedicationCatalog[]> {
    let params = new HttpParams();
    if (q != null && q.trim() !== '') {
      params = params.set('q', q.trim());
    }
    return this.http.get<MedicationCatalog[]>(
      `${CATALOG_BASE}/medications/search/by-active-principle`,
      { params }
    );
  }

  getMedication(id: number): Observable<MedicationCatalog> {
    return this.http.get<MedicationCatalog>(`${CATALOG_BASE}/medications/${id}`);
  }

  createMedication(body: MedicationCatalog): Observable<MedicationCatalog> {
    return this.http.post<MedicationCatalog>(`${CATALOG_BASE}/medications`, body);
  }

  updateMedication(id: number, body: MedicationCatalog): Observable<MedicationCatalog> {
    return this.http.put<MedicationCatalog>(`${CATALOG_BASE}/medications/${id}`, body);
  }

  deleteMedication(id: number): Observable<void> {
    return this.http.delete<void>(`${CATALOG_BASE}/medications/${id}`);
  }

  getGenericEquivalents(referenceMedicationId: number): Observable<MedicationCatalog[]> {
    return this.http.get<MedicationCatalog[]>(
      `${CATALOG_BASE}/medications/${referenceMedicationId}/generics`
    );
  }

  addGenericEquivalent(referenceMedicationId: number, genericMedicationId: number): Observable<MedicationCatalog> {
    return this.http.post<MedicationCatalog>(
      `${CATALOG_BASE}/medications/${referenceMedicationId}/generics`,
      { genericMedicationId }
    );
  }

  removeGenericEquivalent(medicationId: number): Observable<MedicationCatalog> {
    return this.http.delete<MedicationCatalog>(
      `${CATALOG_BASE}/medications/${medicationId}/generic-reference`
    );
  }

  listCategories(): Observable<CatalogCategory[]> {
    return this.http.get<CatalogCategory[]>(`${CATALOG_BASE}/categories`);
  }

  getCategory(id: number): Observable<CatalogCategory> {
    return this.http.get<CatalogCategory>(`${CATALOG_BASE}/categories/${id}`);
  }

  createCategory(body: CatalogCategory): Observable<CatalogCategory> {
    return this.http.post<CatalogCategory>(`${CATALOG_BASE}/categories`, body);
  }

  updateCategory(id: number, body: CatalogCategory): Observable<CatalogCategory> {
    return this.http.put<CatalogCategory>(`${CATALOG_BASE}/categories/${id}`, body);
  }

  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${CATALOG_BASE}/categories/${id}`);
  }

  listActivePrinciples(search?: string): Observable<CatalogActivePrinciple[]> {
    let params = new HttpParams();
    if (search != null && search.trim() !== '') {
      params = params.set('search', search.trim());
    }
    return this.http.get<CatalogActivePrinciple[]>(`${CATALOG_BASE}/active-principles`, { params });
  }

  getActivePrinciple(id: number): Observable<CatalogActivePrinciple> {
    return this.http.get<CatalogActivePrinciple>(`${CATALOG_BASE}/active-principles/${id}`);
  }

  createActivePrinciple(body: CatalogActivePrinciple): Observable<CatalogActivePrinciple> {
    return this.http.post<CatalogActivePrinciple>(`${CATALOG_BASE}/active-principles`, body);
  }

  updateActivePrinciple(id: number, body: CatalogActivePrinciple): Observable<CatalogActivePrinciple> {
    return this.http.put<CatalogActivePrinciple>(`${CATALOG_BASE}/active-principles/${id}`, body);
  }

  deleteActivePrinciple(id: number): Observable<void> {
    return this.http.delete<void>(`${CATALOG_BASE}/active-principles/${id}`);
  }
}
