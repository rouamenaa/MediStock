import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PharmacyRoutingModule } from './pharmacy-routing.module';
import { PharmacyListComponent } from './pharmacy-list/pharmacy-list.component';
import { PharmacyFormComponent } from './pharmacy-form/pharmacy-form.component';

@NgModule({
  declarations: [
    PharmacyListComponent,
    PharmacyFormComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    PharmacyRoutingModule
  ]
})
export class PharmacyModule {}