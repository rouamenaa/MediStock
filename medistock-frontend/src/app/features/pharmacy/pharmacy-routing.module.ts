import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PharmacyListComponent } from './pharmacy-list/pharmacy-list.component';
import { PharmacyFormComponent } from './pharmacy-form/pharmacy-form.component';

const routes: Routes = [
  { path: 'list',     component: PharmacyListComponent },
  { path: 'new',      component: PharmacyFormComponent },
  { path: 'edit/:id', component: PharmacyFormComponent },
  { path: '',         redirectTo: 'list', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PharmacyRoutingModule {}