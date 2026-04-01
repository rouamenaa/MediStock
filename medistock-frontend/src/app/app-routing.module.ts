import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { 
    path: 'pharmacystock', 
    loadChildren: () => import('./features/pharmacystock/pharmacystock.module').then(m => m.PharmacystockModule) 
  },
  // 👇 Nouvelles routes ajoutées
  { 
    path: 'pharmacies', 
    loadChildren: () => import('./features/pharmacy/pharmacy.module').then(m => m.PharmacyModule) 
  },
  { 
    path: 'staff', 
    loadChildren: () => import('./features/staff/staff.module').then(m => m.StaffModule) 
  },
  // 👇 Ces deux lignes restent identiques
  { path: '', redirectTo: 'pharmacystock/pharmacystocklist', pathMatch: 'full' },  
  { path: '**', redirectTo: 'pharmacystock/pharmacystocklist' }  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}