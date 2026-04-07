import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
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
  registeredEmail = '';
  sending = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  requestOtp() {
    this.clearMessages();
    if (!this.userId.trim()) {
      this.error = 'Please enter a User ID.';
      return;
    }

    this.sending = true;
    this.authService.forgotPassword(this.userId.trim()).subscribe({
      next: (response) => {
        this.step = 'reset';
        this.registeredEmail = response?.email || '';
        this.successMessage = response?.message || 'An OTP has been sent to your registered email address.';
        this.sending = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Unable to send OTP right now.';
        this.sending = false;
      }
    });
  }

  resetPassword() {
    this.clearMessages();

    if (!this.otp.trim() || !this.newPassword || !this.confirmPassword) {
      this.error = 'All fields are required.';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.error = 'Passwords do not match.';
      return;
    }

    this.sending = true;
    this.authService.resetPassword(this.userId.trim(), this.otp.trim(), this.newPassword).subscribe({
      next: () => {
        this.successMessage = 'Password has been reset successfully! Redirecting to login...';
        this.sending = false;
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      },
      error: (err) => {
        this.error = err.error?.message || 'An unexpected error occurred. Could not reset password.';
        this.sending = false;
        console.error('Password reset error:', err);
      }
    });
  }

  resendOtp() {
    this.clearMessages();
    this.sending = true;
    this.authService.resendOtp(this.userId.trim()).subscribe({
      next: (response) => {
        this.registeredEmail = response?.email || this.registeredEmail;
        this.successMessage = response?.message || 'A new OTP has been sent.';
        this.sending = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Unable to resend OTP right now.';
        this.sending = false;
      }
    });
  }

  goBackToRequest() {
    this.step = 'request';
    this.clearMessages();
    this.otp = '';
    this.newPassword = '';
    this.confirmPassword = '';
    this.registeredEmail = '';
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
