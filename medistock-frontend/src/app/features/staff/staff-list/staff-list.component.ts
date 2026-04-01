import { Component, OnInit } from '@angular/core';
import { StaffService, Staff } from '../services/staff.service';

@Component({
  selector: 'app-staff-list',
  templateUrl: './staff-list.component.html',
  styleUrls: ['./staff-list.component.css']
})
export class StaffListComponent implements OnInit {
  staffList: Staff[] = [];
  message = '';

  constructor(private staffService: StaffService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.staffService.getAll().subscribe(data => this.staffList = data);
  }

  delete(id: number): void {
    if (confirm('Supprimer ce membre du staff ?')) {
      this.staffService.delete(id).subscribe(() => {
        this.message = 'Staff supprimé.';
        this.load();
      });
    }
  }
}