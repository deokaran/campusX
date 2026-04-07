import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { UserService } from '../services/user.service';
import { User } from '../models/user';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-manage-admins',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container-fluid">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2 class="h3 mb-0">Manage Admins</h2>
        <a routerLink="/admin/add-admin" class="btn btn-primary">
          <i class="fas fa-plus me-2"></i>Add New Admin
        </a>
      </div>

      <div class="card shadow-sm"> 
        <div class="card-body">
          @if (admins.length === 0) {
            <div class="text-center py-5">
              <i class="fas fa-user-shield fa-3x text-muted mb-3"></i>
              <p class="text-muted">No admins found. Add your first admin!</p>
              <a routerLink="/admin/add-admin" class="btn btn-primary mt-2">
                <i class="fas fa-plus me-2"></i>Add Admin
              </a>
            </div>
          } @else {
            <div class="table-responsive">
              <table class="table table-hover">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Mobile</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  @for (admin of admins; track getAdminId(admin)) {
                    <tr>
                      <td><strong>{{ getAdminId(admin) }}</strong></td>
                      <td>{{ getAdminName(admin) }}</td>
                      <td>{{ admin.email }}</td>
                      <td><span class="badge bg-danger">{{ admin.details?.role || 'Admin' }}</span></td>
                      <td>{{ admin.details?.mobile || 'N/A' }}</td>
                      <td>
                        <div class="btn-group btn-group-sm">
                          <a [routerLink]="['/admin/add-admin', getAdminId(admin)]" class="btn btn-outline-primary">
                            <i class="fas fa-edit"></i>
                          </a>
                          <button (click)="deleteAdmin(admin)" class="btn btn-outline-danger" 
                                  [disabled]="admins.length === 1">
                            <i class="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </div>
      </div>

      @if (admins.length === 1) {
        <div class="alert alert-warning mt-3">
          <i class="fas fa-exclamation-triangle me-2"></i>
          <strong>Warning:</strong> You cannot delete the last admin. At least one admin must exist in the system.
        </div>
      }
    </div>
  `,
})
export class ManageAdminsComponent implements OnInit, OnDestroy {
  admins: User[] = [];
  private subscriptions: Subscription[] = [];

  constructor(
    private userService: UserService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Subscribe to user changes
    const usersSub = this.userService.getUsersObservable().subscribe(users => {
      this.admins = users.filter(u => u.role === 'A');
      console.log('Admins loaded:', this.admins);
      this.cdr.markForCheck();
    });
    this.subscriptions.push(usersSub);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  getAdminId(admin: User): string {
    return admin.id || admin._id || 'N/A';
  }

  getAdminName(admin: User): string {
    if (admin.name) {
      return admin.name;
    }
    
    const parts = [
      admin.firstName || '',
      admin.middleName || '',
      admin.lastName || ''
    ].filter(p => p.trim());
    
    return parts.join(' ') || 'N/A';
  }

  deleteAdmin(admin: User) {
    const adminId = this.getAdminId(admin);
    const adminName = this.getAdminName(admin);
    
    // Prevent deleting if only one admin exists
    if (this.admins.length === 1) {
      alert('Cannot delete the last admin. At least one admin must exist in the system.');
      return;
    }

    if (confirm(`Are you sure you want to delete admin ${adminName} (${adminId})?`)) {
      this.userService.deleteUser(adminId);
      alert('Admin deleted successfully!');
    }
  }
}