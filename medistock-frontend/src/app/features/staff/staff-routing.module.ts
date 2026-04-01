import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StaffListComponent } from './staff-list/staff-list.component';
import { StaffFormComponent } from './staff-form/staff-form.component';

const routes: Routes = [
  { path: 'list',     component: StaffListComponent },
  { path: 'new',      component: StaffFormComponent },
  { path: 'edit/:id', component: StaffFormComponent },
  { path: '',         redirectTo: 'list', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StaffRoutingModule {}