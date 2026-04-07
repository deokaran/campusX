import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit, OnDestroy {
  user: User | null = null;
  editableUser: User | null = null;
  isEditMode = false;
  canEditAllDetails = false;
  private userSubscription!: Subscription;

  signatureImg: string | ArrayBuffer | null = 'https://via.placeholder.com/200x80.png?text=Your+Signature';
  profilePic: string | ArrayBuffer | null = '';

  constructor(
    private authService: AuthService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.userSubscription = this.authService.currentUser$.subscribe(user => {
      console.log("USER DATA 👉", user); // 🔥 debug

      this.user = user;

      if (user) {
        this.profilePic = user.details?.avatarUrl || '';
        this.canEditAllDetails = this.authService.currentUserValue?.role === 'A';
      }

      this.setEditMode(false);
    });
  }

  ngOnDestroy() {
    this.userSubscription?.unsubscribe();
  }

  setEditMode(isEditing: boolean) {
    this.isEditMode = isEditing;

    if (isEditing && this.user) {
      this.editableUser = JSON.parse(JSON.stringify(this.user));
    } else {
      this.editableUser = null;
    }
  }

  saveProfile() {
    if (!this.editableUser || !this.user) return;

    let updatedUser: any = JSON.parse(JSON.stringify(this.user));

    if (this.canEditAllDetails) {
      updatedUser = JSON.parse(JSON.stringify(this.editableUser));
    } else {
      updatedUser.email = this.editableUser.email;
      updatedUser.details.mobile = this.editableUser.details.mobile;

      if (updatedUser.role === 'S') {
        updatedUser.details.guardianNo = this.editableUser.details.guardianNo;
      }
    }

    updatedUser.details.avatarUrl = this.profilePic;

    this.userService.updateUser(updatedUser);
    this.authService.updateCurrentUser(updatedUser);

    this.setEditMode(false);
  }

  onProfilePicChange(event: Event) {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => this.profilePic = e.target?.result || '';
      reader.readAsDataURL(input.files[0]);
    }
  }

  onSignatureChange(event: Event) {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => this.signatureImg = e.target?.result || '';
      reader.readAsDataURL(input.files[0]);
    }
  }
}