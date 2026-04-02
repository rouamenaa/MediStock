import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { OrderListComponent } from './order-list/order-list.component';
import { OrderFormComponent } from './order-form/order-form.component';

const routes: Routes = [
  { path: '', component: OrderListComponent },
  { path: 'new', component: OrderFormComponent }
];

@NgModule({
  declarations: [OrderListComponent, OrderFormComponent],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule.forChild(routes)]
})
export class OrderModule { }