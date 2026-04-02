import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Medication } from "../models/medication.model";
import { Observable } from "rxjs";

@Injectable({ providedIn: 'root' })
export class MedicationService {

  private baseUrl = 'http://localhost:8081/api/medications';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Medication[]> {
    return this.http.get<Medication[]>(this.baseUrl);
  }
}