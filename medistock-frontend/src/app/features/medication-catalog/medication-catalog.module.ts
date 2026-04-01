import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MedicationCatalogRoutingModule } from './medication-catalog-routing.module';
import { MedicationListComponent } from './medication-list/medication-list.component';
import { MedicationDetailComponent } from './medication-detail/medication-detail.component';
import { CategoryListComponent } from './category-list/category-list.component';
import { ActivePrincipleListComponent } from './active-principle-list/active-principle-list.component';
import { CatalogConfirmDialogComponent } from './catalog-confirm-dialog/catalog-confirm-dialog.component';

@NgModule({
  declarations: [
    MedicationListComponent,
    MedicationDetailComponent,
    CategoryListComponent,
    ActivePrincipleListComponent,
    CatalogConfirmDialogComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    MedicationCatalogRoutingModule
  ]
})
export class MedicationCatalogModule {}
