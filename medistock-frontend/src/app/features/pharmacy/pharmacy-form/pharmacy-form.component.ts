import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PharmacyService, Pharmacy } from '../services/pharmacy.service';

@Component({
  selector: 'app-pharmacy-form',
  templateUrl: './pharmacy-form.component.html',
  styleUrls: ['./pharmacy-form.component.css']
})
export class PharmacyFormComponent implements OnInit {
  pharmacy: Pharmacy = { name: '', address: '', phone: '' };
  isEdit = false;
  id!: number;

  constructor(
    private pharmacyService: PharmacyService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.params['id'];
    if (this.id) {
      this.isEdit = true;
      this.pharmacyService.getById(this.id).subscribe(data => this.pharmacy = data);
    }
  }

  save(): void {
    const obs = this.isEdit
      ? this.pharmacyService.update(this.id, this.pharmacy)
      : this.pharmacyService.create(this.pharmacy);

    obs.subscribe(() => this.router.navigate(['/pharmacies']));
  }
}