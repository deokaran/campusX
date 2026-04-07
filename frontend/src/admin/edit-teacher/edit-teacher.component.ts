import { Component, ChangeDetectionStrategy, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user';
import { CommonModule, formatDate } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { DepartmentService } from '../../services/department.service';
import { Department } from '../../models/department';

@Component({
  selector: 'app-edit-teacher',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './edit-teacher.component.html',
  styleUrls: ['./edit-teacher.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditTeacherComponent implements OnInit, OnDestroy {
  teacher: User | null = null;
  isEditMode = false;
  pageTitle = 'Add Teacher';
  today = formatDate(new Date(), 'yyyy-MM-dd', 'en-US');
  departments: Department[] = [];
  private routeSub!: Subscription;
  
  // Profile picture
  profilePic: string | ArrayBuffer | null = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private departmentService: DepartmentService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Load departments
    this.departmentService.getDepartmentsObservable().subscribe(depts => {
      this.departments = depts;
      this.cdr.markForCheck();
    });

    this.routeSub = this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.isEditMode = true;
        this.pageTitle = 'Edit Teacher';
        const existingTeacher = this.userService.getUserById(id);
        this.teacher = existingTeacher ? JSON.parse(JSON.stringify(existingTeacher)) : null;
        
        // Load existing profile picture
        if (this.teacher?.details?.avatarUrl) {
          this.profilePic = this.teacher.details.avatarUrl;
        }
      } else {
        this.isEditMode = false;
        this.pageTitle = 'Add Teacher';
        // Generate next teacher ID
        const nextId = this.generateNextTeacherId();
        this.teacher = {
          id: nextId,
          _id: nextId,
          firstName: '',
          middleName: '',
          lastName: '',
          email: '',
          role: 'T',
          password: 'password123',
          details: {
            departmentId: '',
            specialization: '',
            mobile: '',
            dob: '',
            joiningDate: '',
            avatarUrl: ''
          }
        };
      }
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy(): void {
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
  }

  generateNextTeacherId(): string {
    const teachers = this.userService.getTeachers();
    
    if (teachers.length === 0) {
      return 'T00001';
    }
    
    // Find highest teacher ID
    const ids = teachers.map(t => {
      const id = t.id || t._id || '';
      return parseInt(id.substring(1));
    });
    
    const maxId = Math.max(...ids);
    const nextId = maxId + 1;
    
    return 'T' + nextId.toString().padStart(5, '0');
  }

  onProfilePicChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('Image too large! Maximum size is 10MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        this.profilePic = e.target?.result || '';
        this.cdr.markForCheck();
      };
      reader.readAsDataURL(file);
    }
  }

  saveTeacher() {
    if (this.teacher) {
      // Build name field
      this.teacher.name = `${this.teacher.firstName} ${this.teacher.middleName || ''} ${this.teacher.lastName}`.trim();
      
      // Save profile picture to avatarUrl
      if (this.profilePic) {
        this.teacher.details.avatarUrl = this.profilePic as string;
      }
      
      console.log('Saving teacher:', this.teacher);
      
      if (this.isEditMode) {
        this.userService.updateUser(this.teacher);
        alert('Teacher updated successfully!');
      } else {
        this.userService.addUser(this.teacher);
        
        // Wait a bit then navigate
        setTimeout(() => {
          alert('Teacher added successfully with ID: ' + this.teacher!.id);
          this.router.navigate(['/admin/manage-teachers']);
        }, 300);
        return;
      }
      
      this.router.navigate(['/admin/manage-teachers']);
    } else {
      alert('Please fill in all required fields');
    }
  }
}
