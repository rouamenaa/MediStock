import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Medication } from "../models/medication.model";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { MedicationCatalog } from "../models/catalog-medication.model";

@Injectable({ providedIn: 'root' })
export class MedicationService {

  private baseUrl = 'http://localhost:8090/api/catalog/medications';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Medication[]> {
    return this.http.get<MedicationCatalog[]>(this.baseUrl).pipe(
      map(items =>
        items.map(item => ({
          id: item.id ?? 0,
          name: item.name,
          dosage: item.dosage
        }))
      )
    );
  }
}
