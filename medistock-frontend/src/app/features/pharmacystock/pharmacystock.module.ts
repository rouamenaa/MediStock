import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PharmacystockRoutingModule } from './pharmacystock-routing.module';

import { StockListComponent } from './stock-list/stock-list.component';
import { StockBatchComponent } from './stock-batch/stock-batch.component';
import { StockHistoryComponent } from './stock-history/stock-history.component';

@NgModule({
  declarations: [
    StockListComponent,
    StockBatchComponent,
    StockHistoryComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    PharmacystockRoutingModule
  ]
})
export class PharmacystockModule {}