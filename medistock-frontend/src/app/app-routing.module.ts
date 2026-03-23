import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: 'pharmacystock', loadChildren: () => import('./features/pharmacystock/pharmacystock.module').then(m => m.PharmacystockModule) },
  { path: '', redirectTo: 'pharmacystock/pharmacystocklist', pathMatch: 'full' },  
  { path: '**', redirectTo: 'pharmacystock/pharmacystocklist' }  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}