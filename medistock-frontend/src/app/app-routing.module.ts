import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';


import { LoginComponent } from './components/login/login.component';
import { AuthGuard } from './guards/auth.guard';
import { LayoutComponent } from './core/layout/layout.component';
import { RegisterComponent } from './components/register/register.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
  {
    path: 'pharmacystock',
    loadChildren: () => import('./features/pharmacystock/pharmacystock.module')
      .then(m => m.PharmacystockModule)
  },

  {
    path: 'pharmacies',
    loadChildren: () => import('./features/pharmacy/pharmacy.module')
      .then(m => m.PharmacyModule)
  },
  {
    path: 'staff',
    loadChildren: () => import('./features/staff/staff.module')
      .then(m => m.StaffModule)
  },
  {


    path: 'catalog',
    loadChildren: () => import('./features/medication-catalog/medication-catalog.module').then(m => m.MedicationCatalogModule)

  },
  {
    path: 'prescriptions',
    loadChildren: () => import('./features/prescription/prescription.module')
      .then(m => m.PrescriptionModule)
  },
  {
    path: 'orders',
    loadChildren: () => import('./features/order/order.module')
      .then(m => m.OrderModule)


  }
]
  },

  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule { }