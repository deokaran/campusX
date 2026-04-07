import { Component, ChangeDetectionStrategy, OnInit, ChangeDetectorRef } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LogoComponent } from '../shared/logo/logo.component';

@Component({
  selector: 'app-login',
  imports: [FormsModule, CommonModule, RouterLink, LogoComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent implements OnInit {
  userId = '';
  password = '';
  error = '';
  showPassword = false;
  activeTab: 'S' | 'T' | 'A' = 'S';
  isLoading = false;

  constructor(
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.userId = 'A00001';
    this.password = 'password123';
  }

  get loginTitle(): string {
    switch (this.activeTab) {
      case 'S': return 'Student Login';
      case 'T': return 'Teacher Login';
      case 'A': return 'Admin Login';
    }
  }

  get userIdPlaceholder(): string {
    switch (this.activeTab) {
      case 'S': return 'e.g., S00001';
      case 'T': return 'e.g., T00001';
      case 'A': return 'e.g., A00001';
    }
  }

  selectTab(tab: 'S' | 'T' | 'A'): void {
    this.activeTab = tab;
    this.error = '';
    this.cdr.markForCheck();
  }

  onSubmit() {
    this.isLoading = true;
    this.error = '';
    this.cdr.markForCheck();
    
    this.authService.login(this.userId, this.password).subscribe({
      next: (loggedIn) => {
        this.isLoading = false;
        if (!loggedIn) {
          this.error = 'Invalid credentials. Please try again.';
        }
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.isLoading = false;
        this.error = 'Login failed. Please check if the backend is running.';
        console.error('Login error:', err);
        this.cdr.markForCheck();
      }
    });
  }
}
