import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { PrescriptionListComponent } from './prescription-list/prescription-list.component';
import { PrescriptionFormComponent } from './prescription-form/prescription-form.component';

const routes: Routes = [
  { path: '', component: PrescriptionListComponent },
  { path: 'new', component: PrescriptionFormComponent }
];

@NgModule({
  declarations: [PrescriptionListComponent, PrescriptionFormComponent],
  imports: [CommonModule, FormsModule, RouterModule.forChild(routes)]
})
export class PrescriptionModule { }