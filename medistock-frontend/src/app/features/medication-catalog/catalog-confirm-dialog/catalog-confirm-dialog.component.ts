import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-catalog-confirm-dialog',
  templateUrl: './catalog-confirm-dialog.component.html',
  styleUrls: ['./catalog-confirm-dialog.component.css', '../catalog-shared.css']
})
export class CatalogConfirmDialogComponent {

  @Input() open = false;
  @Input() title = 'Confirmation';
  @Input() message = '';
  @Input() confirmLabel = 'Confirmer';
  @Input() cancelLabel = 'Annuler';
  /** true = bouton principal rouge (suppression) */
  @Input() confirmDanger = true;

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  readonly titleId = 'catalog-confirm-title-' + Math.random().toString(36).slice(2, 11);

  onOverlayClick(ev: MouseEvent): void {
    if (ev.target === ev.currentTarget) {
      this.cancel.emit();
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }

  onConfirm(): void {
    this.confirm.emit();
  }
}
