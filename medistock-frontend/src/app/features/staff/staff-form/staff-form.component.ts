import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StaffService, Staff } from '../services/staff.service';
import { PharmacyService, Pharmacy } from '../../pharmacy/services/pharmacy.service';

@Component({
  selector: 'app-staff-form',
  templateUrl: './staff-form.component.html',
  styleUrls: ['./staff-form.component.css']
})
export class StaffFormComponent implements OnInit {
  staff: Staff = { fullName: '', role: '', phone: '' };
  pharmacies: Pharmacy[] = [];
  selectedPharmacyId!: number;
  isEdit = false;
  id!: number;

  constructor(
    private staffService: StaffService,
    private pharmacyService: PharmacyService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.pharmacyService.getAll().subscribe(data => this.pharmacies = data);
    this.id = this.route.snapshot.params['id'];
    if (this.id) {
      this.isEdit = true;
      this.staffService.getById(this.id).subscribe(data => {
        this.staff = data;
        this.selectedPharmacyId = data.pharmacy?.id!;
      });
    }
  }

  save(): void {
    this.staff.pharmacy = { id: this.selectedPharmacyId };
    const obs = this.isEdit
      ? this.staffService.update(this.id, this.staff)
      : this.staffService.create(this.staff);

    obs.subscribe(() => this.router.navigate(['/staff']));
  }
}