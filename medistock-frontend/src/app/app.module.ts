import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { StockBatchComponent } from './features/pharmacystock/stock-batch/stock-batch.component';
import { StockHistoryComponent } from './features/pharmacystock/stock-history/stock-history.component';
import { StockListComponent } from './features/pharmacystock/stock-list/stock-list.component';
import { PharmacystockModule } from './features/pharmacystock/pharmacystock.module';
import { LayoutComponent } from "./core/layout/layout.component";
import { HttpClientModule } from '@angular/common/http';


@NgModule({
  declarations: [
    AppComponent,
   

  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    PharmacystockModule,
    LayoutComponent,
    HttpClientModule
],
  providers: [
    provideClientHydration()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
