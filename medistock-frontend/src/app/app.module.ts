import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';           // ✅ Fix ngModel
import { CommonModule } from '@angular/common';         // ✅ Fix date, number, ngClass pipes
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PharmacystockModule } from './features/pharmacystock/pharmacystock.module';
import { LayoutComponent } from './core/layout/layout.component';

// ── Order Components ───────────────────────────────────────────────────────
import { OrderListComponent } from './features/order/order-list/order-list.component';
import { OrderFormComponent } from './features/order/order-form/order-form.component';

// ── Prescription Components ────────────────────────────────────────────────
import { PrescriptionListComponent } from './features/prescription/prescription-list/prescription-list.component';
import { PrescriptionFormComponent } from './features/prescription/prescription-form/prescription-form.component';

@NgModule({
  declarations: [
    AppComponent,

    // Orders
    OrderListComponent,
    OrderFormComponent,

    // Prescriptions
    PrescriptionListComponent,
    PrescriptionFormComponent,
  ],
  imports: [
    BrowserModule,
    CommonModule,        // ✅ ngClass, *ngFor, *ngIf, date pipe, number pipe
    FormsModule,         // ✅ [(ngModel)]
    HttpClientModule,    // ✅ HttpClient dans les services
    AppRoutingModule,
    PharmacystockModule,
    LayoutComponent,
  ],
  providers: [
    provideClientHydration()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }