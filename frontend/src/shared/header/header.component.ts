import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { User } from '../../models/user';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-header',
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  @Output() sidebarToggled = new EventEmitter<void>();
  
  @Input({ required: true }) pageTitle!: string;
  @Input({ required: true }) themeColor!: string;
  
  currentUser$: Observable<User | null>;

  constructor(private authService: AuthService) {
    this.currentUser$ = this.authService.currentUser$;
  }
  
  logout() {
    this.authService.logout();
  }

  get logoutButtonClasses(): string {
    const base = 'btn btn-sm text-white';
    const colorMap: { [key: string]: string } = {
      rose: 'btn-danger',
      amber: 'btn-warning',
      sky: 'btn-info'
    };
    return `${base} ${colorMap[this.themeColor] || colorMap.rose}`;
  }
}
