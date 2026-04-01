import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { OrderListComponent } from './features/order/order-list/order-list.component';
import { OrderFormComponent } from './features/order/order-form/order-form.component';
import { PrescriptionListComponent } from './features/prescription/prescription-list/prescription-list.component';
import { PrescriptionFormComponent } from './features/prescription/prescription-form/prescription-form.component';

const routes: Routes = [

  // ── Pharmacy Stock (lazy loading existant) ─────────────────────────────────
  {
    path: 'pharmacystock',
    loadChildren: () => import('./features/pharmacystock/pharmacystock.module')
      .then(m => m.PharmacystockModule)
  },

  // ── Orders ─────────────────────────────────────────────────────────────────
  { path: 'orders',     component: OrderListComponent },
  { path: 'orders/new', component: OrderFormComponent },

  // ── Prescriptions ──────────────────────────────────────────────────────────
  { path: 'prescriptions',     component: PrescriptionListComponent },
  { path: 'prescriptions/new', component: PrescriptionFormComponent },

  // ── Default & Fallback ─────────────────────────────────────────────────────
  { path: '', redirectTo: 'pharmacystock/pharmacystocklist', pathMatch: 'full' },
  { path: '**', redirectTo: 'pharmacystock/pharmacystocklist' }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }