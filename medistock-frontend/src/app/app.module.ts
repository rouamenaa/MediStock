import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';           
import { CommonModule } from '@angular/common';         

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PharmacystockModule } from './features/pharmacystock/pharmacystock.module';
import { LayoutComponent } from "./core/layout/layout.component";
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

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
    CommonModule,        
    FormsModule,         
    HttpClientModule,    
    AppRoutingModule,
    PharmacystockModule,
    LayoutComponent,
    BrowserAnimationsModule
],
  providers: [
    provideClientHydration()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }