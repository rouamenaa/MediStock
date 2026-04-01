import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MedicationListComponent } from './medication-list/medication-list.component';
import { MedicationDetailComponent } from './medication-detail/medication-detail.component';
import { CategoryListComponent } from './category-list/category-list.component';
import { ActivePrincipleListComponent } from './active-principle-list/active-principle-list.component';

const routes: Routes = [
  { path: 'medications', component: MedicationListComponent },
  { path: 'medications/:id', component: MedicationDetailComponent },
  { path: 'categories', component: CategoryListComponent },
  { path: 'active-principles', component: ActivePrincipleListComponent },
  { path: '', redirectTo: 'medications', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MedicationCatalogRoutingModule {}
