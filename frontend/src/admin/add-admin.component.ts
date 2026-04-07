import { Component, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UserService } from '../services/user.service';
import { User } from '../models/user';
import { CommonModule, formatDate } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-add-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    @if (admin) {
      <div class="card shadow-sm">
        <div class="card-body p-4 p-lg-5">
          <div class="d-flex align-items-center justify-content-between mb-4 border-bottom pb-3">
            <h2 class="card-title h3">{{ pageTitle }}</h2>
            <a routerLink="/admin/manage-admins" class="btn btn-secondary btn-sm">
              <i class="fas fa-arrow-left me-2"></i>Back to List
            </a>
          </div>
          
          <form #adminForm="ngForm" (ngSubmit)="saveAdmin()">
            <fieldset class="vstack gap-4">
              <legend class="h5 fw-semibold text-dark mb-3">Admin Details</legend>
              
              <div class="row g-3">
                @if (!isEditMode) {
                  <div class="col-md-12">
                    <label for="id" class="form-label">Admin ID <span class="text-danger">*</span></label>
                    <input id="id" type="text" [(ngModel)]="admin.id" name="id" required 
                           class="form-control" placeholder="e.g., A00002">
                    <small class="form-text text-muted">Format: A followed by 5 digits (e.g., A00002, A00003)</small>
                  </div>
                }
                
                <div class="col-md-4">
                  <label for="firstName" class="form-label">First Name <span class="text-danger">*</span></label>
                  <input id="firstName" type="text" [(ngModel)]="admin.firstName" name="firstName" 
                         required class="form-control" placeholder="First Name">
                </div>
                
                <div class="col-md-4">
                  <label for="middleName" class="form-label">Middle Name</label>
                  <input id="middleName" type="text" [(ngModel)]="admin.middleName" name="middleName" 
                         class="form-control" placeholder="Middle Name (Optional)">
                </div>
                
                <div class="col-md-4">
                  <label for="lastName" class="form-label">Last Name <span class="text-danger">*</span></label>
                  <input id="lastName" type="text" [(ngModel)]="admin.lastName" name="lastName" 
                         required class="form-control" placeholder="Last Name">
                </div>
                
                <div class="col-md-6">
                  <label for="email" class="form-label">Email <span class="text-danger">*</span></label>
                  <input id="email" type="email" [(ngModel)]="admin.email" name="email" 
                         required class="form-control" placeholder="admin@campusx.edu">
                </div>
                
                <div class="col-md-6">
                  <label for="mobile" class="form-label">Mobile Number</label>
                  <input id="mobile" type="tel" [(ngModel)]="admin.details.mobile" name="mobile" 
                         class="form-control" placeholder="+91 9876543210">
                </div>
                
                <div class="col-md-6">
                  <label for="adminRole" class="form-label">Admin Role/Position</label>
                  <input id="adminRole" type="text" [(ngModel)]="admin.details.role" name="adminRole" 
                         class="form-control" placeholder="e.g., Principal, Vice Principal, Dean">
                </div>
                
                <div class="col-md-6">
                  <label for="dob" class="form-label">Date of Birth</label>
                  <input id="dob" type="date" [(ngModel)]="admin.details.dob" name="dob" 
                         [max]="today" class="form-control">
                </div>
                
                <div class="col-md-6">
                  <label for="joiningDate" class="form-label">Joining Date</label>
                  <input id="joiningDate" type="date" [(ngModel)]="admin.details.joiningDate" 
                         name="joiningDate" [max]="today" class="form-control">
                </div>
              </div>
            </fieldset>
            
            @if (!isEditMode) {
              <div class="alert alert-info mt-4">
                <i class="fas fa-info-circle me-2"></i>
                <strong>Default Password:</strong> The admin will be created with the default password <code>password123</code>. 
                They can change it after logging in.
              </div>
            }
            
            <div class="d-flex justify-content-end pt-4 mt-4 border-top">
              <button type="submit" [disabled]="!adminForm.valid" class="btn btn-success d-flex align-items-center">
                <i class="fas fa-save me-2"></i>{{ isEditMode ? 'Update Admin' : 'Add Admin' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    } @else {
      <p class="text-center text-muted">Loading admin details...</p>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddAdminComponent implements OnInit, OnDestroy {
  admin: User | null = null;
  isEditMode = false;
  pageTitle = 'Add Admin';
  today = formatDate(new Date(), 'yyyy-MM-dd', 'en-US');
  private routeSub!: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.routeSub = this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.isEditMode = true;
        this.pageTitle = 'Edit Admin';
        const existingAdmin = this.userService.getUserById(id);
        this.admin = existingAdmin ? JSON.parse(JSON.stringify(existingAdmin)) : null;
      } else {
        this.isEditMode = false;
        this.pageTitle = 'Add Admin';
        // Generate next admin ID
        const nextId = this.generateNextAdminId();
        this.admin = {
          id: nextId,
          firstName: '',
          middleName: '',
          lastName: '',
          email: '',
          role: 'A',
          details: {
            role: '',
            mobile: '',
            dob: '',
            joiningDate: ''
          }
        };
      }
    });
  }

  ngOnDestroy(): void {
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
  }

  generateNextAdminId(): string {
    const allUsers = this.userService.getUsers();
    const admins = allUsers.filter(u => u.role === 'A');
    
    if (admins.length === 0) {
      return 'A00001';
    }
    
    // Find highest admin ID
    const ids = admins.map(a => parseInt((a.id || a._id || '').substring(1)));
    const maxId = Math.max(...ids);
    const nextId = maxId + 1;
    
    return 'A' + nextId.toString().padStart(5, '0');
  }

  saveAdmin() {
    if (this.admin) {
      // Set name field for backward compatibility
      this.admin.name = `${this.admin.firstName} ${this.admin.middleName || ''} ${this.admin.lastName}`.trim();
      
      if (this.isEditMode) {
        this.userService.updateUser(this.admin);
        alert('Admin updated successfully!');
      } else {
        this.userService.addUser(this.admin);
        alert('Admin added successfully with default password: password123');
      }
      this.router.navigate(['/admin/manage-admins']);
    }
  }
}
