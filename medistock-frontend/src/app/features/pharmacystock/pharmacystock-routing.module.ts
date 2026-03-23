import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StockListComponent } from './stock-list/stock-list.component';
import { StockBatchComponent } from './stock-batch/stock-batch.component';
import { StockHistoryComponent } from './stock-history/stock-history.component';

const routes: Routes = [
  { path: 'pharmacystocklist', component: StockListComponent },                       
  { path: ':stockItemId/batches', component: StockBatchComponent },   
  { path: ':stockItemId/history', component: StockHistoryComponent }  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PharmacystockRoutingModule {}