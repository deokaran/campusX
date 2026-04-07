
import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

@Component({
  selector: 'app-logo',
  template: `
    <img [src]="logoUrl" [width]="size" [height]="size" alt="CampusX Logo">
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LogoComponent {
  @Input() size = 40;

  // A professional, modern SVG logo for "CampusX"
  readonly logoUrl = 'https://drive.google.com/thumbnail?id=1sVspvXTbkAnQuaTZ1xLZNxbP1eaRqoz_&sz=w1000';
}
