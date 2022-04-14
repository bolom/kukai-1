import { Component, OnInit } from '@angular/core';
import { ModalComponent } from '../modal.component';

@Component({
  selector: 'app-info',
  templateUrl: './info.component.html',
  styleUrls: ['../../../../scss/components/modals/modal.scss']
})
export class InfoComponent extends ModalComponent implements OnInit {
  message = '';
  href = '';
  title = 'Info';
  name = 'info';
  constructor() {
    super();
  }

  ngOnInit(): void {}

  open(data: any): void {
    this.message = data?.message;
    this.href = data?.href;
    this.title = data?.title || this.title;
    super.open();
  }

  closeModal(): void {
    super.close();
  }
  proceed() {
    if (!!this.href) {
      const newTab = window.open(this.href, '_blank');
      newTab.focus();
      newTab.opener = null;
    }
    this.closeModal();
  }
}
