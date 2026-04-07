
import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MenuItem } from '../../models/user';
import { LogoComponent } from '../logo/logo.component';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, LogoComponent],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent {
  @Input({ required: true }) isExpanded!: boolean;
  @Output() isExpandedChange = new EventEmitter<boolean>();
  
  @Input({ required: true }) menuItems!: MenuItem[];
  @Input({ required: true }) themeColor!: string;
  @Input({ required: true }) roleName!: string;

  @Output() navigated = new EventEmitter<void>();

  toggle() {
    this.isExpanded = !this.isExpanded;
    this.isExpandedChange.emit(this.isExpanded);
  }

  onLinkClick() {
    this.navigated.emit();
  }
}