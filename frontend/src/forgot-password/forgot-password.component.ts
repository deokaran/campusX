import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../services/user.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-forgot-password',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForgotPasswordComponent {
  step: 'request' | 'reset' = 'request';
  userId = '';
  otp = '';
  newPassword = '';
  confirmPassword = '';
  error = '';
  successMessage = '';
  showPassword = false;

  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  requestOtp() {
    this.clearMessages();
    if (!this.userId) {
      this.error = 'Please enter a User ID.';
      return;
    }
    
    const userExists = this.userService.getUserById(this.userId);
    if (userExists) {
      this.step = 'reset';
      this.successMessage = 'An OTP has been sent to your registered email address.';
    } else {
      this.error = 'User ID not found.';
    }
  }

  resetPassword() {
    this.clearMessages();

    if (!this.otp || !this.newPassword || !this.confirmPassword) {
      this.error = 'All fields are required.';
      return;
    }

    if (this.otp !== '0000') {
      this.error = 'Invalid OTP. Please try again.';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.error = 'Passwords do not match.';
      return;
    }
    
    this.userService.updatePassword(this.userId, this.newPassword).subscribe({
      next: () => {
        this.successMessage = 'Password has been reset successfully! Redirecting to login...';
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      },
      error: (err) => {
        this.error = 'An unexpected error occurred. Could not reset password.';
        console.error('Password reset error:', err);
      }
    });
  }
  
  goBackToRequest() {
    this.step = 'request';
    this.clearMessages();
    this.otp = '';
    this.newPassword = '';
    this.confirmPassword = '';
  }
  
  onSubmit() {
    if (this.step === 'request') {
      this.requestOtp();
    } else {
      this.resetPassword();
    }
  }

  private clearMessages() {
    this.error = '';
    this.successMessage = '';
  }
}
