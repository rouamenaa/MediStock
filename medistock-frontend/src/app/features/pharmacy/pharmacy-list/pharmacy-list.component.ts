import { Component, OnInit } from '@angular/core';
import { PharmacyService, Pharmacy } from '../services/pharmacy.service';

@Component({
  selector: 'app-pharmacy-list',
  templateUrl: './pharmacy-list.component.html',
  styleUrls: ['./pharmacy-list.component.css']
})
export class PharmacyListComponent implements OnInit {
  pharmacies: Pharmacy[] = [];
  message = '';

  constructor(private pharmacyService: PharmacyService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.pharmacyService.getAll().subscribe(data => this.pharmacies = data);
  }

  delete(id: number): void {
    if (confirm('Supprimer cette pharmacie ?')) {
      this.pharmacyService.delete(id).subscribe(() => {
        this.message = 'Pharmacie supprimée.';
        this.load();
      });
    }
  }
}