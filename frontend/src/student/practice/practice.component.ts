
import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-practice',
  imports: [CommonModule],
  templateUrl: './practice.component.html',
  styleUrls: ['./practice.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PracticeComponent {
  private sanitizer = inject(DomSanitizer);
  
  readonly compilerUrl: SafeResourceUrl = this.sanitizer.bypassSecurityTrustResourceUrl('https://onecompiler.com/embed/javascript');
}
