import { Component, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent implements OnInit, OnDestroy {
  user: User | null = null;
  editableUser: User | null = null;
  isEditMode = false;
  canEditAllDetails = false;
  private userSubscription!: Subscription;
  
  // Mocks for signature and picture
  signatureImg: string | ArrayBuffer | null = 'https://via.placeholder.com/200x80.png?text=Your+Signature';
  profilePic: string | ArrayBuffer | null = '';

  constructor(
    private authService: AuthService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.userSubscription = this.authService.currentUser$.subscribe(user => {
      this.user = user;
      if (user) {
        this.profilePic = user.details?.avatarUrl;
        // Admin can edit all details on their own profile page.
        this.canEditAllDetails = this.authService.currentUserValue?.role === 'A';
      }
      this.setEditMode(false);
    });
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  setEditMode(isEditing: boolean) {
    this.isEditMode = isEditing;
    if (isEditing && this.user) {
      this.editableUser = JSON.parse(JSON.stringify(this.user)); // Deep copy for editing
    } else {
      this.editableUser = null;
    }
  }

  saveProfile() {
    if (this.editableUser && this.user) {
      let updatedUser;

      if (this.canEditAllDetails) {
        // Admin can edit everything, so take the whole form state.
        updatedUser = JSON.parse(JSON.stringify(this.editableUser));
      } else {
        // Non-admins have restricted edits, so build the object carefully.
        updatedUser = JSON.parse(JSON.stringify(this.user)); // Start with original data
        updatedUser.email = this.editableUser.email;
        updatedUser.details.mobile = this.editableUser.details.mobile;
        
        if (updatedUser.role === 'S') {
          updatedUser.details.guardianNo = this.editableUser.details.guardianNo;
        }
      }

      // Always update avatar from the separate handler, as it's not part of the form model.
      updatedUser.details.avatarUrl = this.profilePic;

      this.userService.updateUser(updatedUser);
      
      // The profile component always deals with the currently logged-in user.
      // So, we must update the auth service state.
      this.authService.updateCurrentUser(updatedUser);
    }
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
