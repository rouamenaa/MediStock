import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { DocumentUploadComponent } from './document-upload/document-upload.component';
import { DocumentListComponent } from './document-list/document-list.component';

const routes: Routes = [
  { path: '', redirectTo: 'list', pathMatch: 'full' },
  { path: 'list', component: DocumentListComponent },
  { path: 'upload', component: DocumentUploadComponent }
];

@NgModule({
  declarations: [DocumentUploadComponent, DocumentListComponent],
  imports: [CommonModule, FormsModule, RouterModule.forChild(routes)]
})
export class DocumentModule {}
