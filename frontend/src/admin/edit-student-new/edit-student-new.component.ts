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
  selector: 'app-edit-student-new',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './edit-student-new.component.html',
  styleUrls: ['./edit-student-new.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditStudentNewComponent implements OnInit, OnDestroy {
  student: User | null = null;
  isEditMode = false;
  pageTitle = 'Add Student';
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
        this.pageTitle = 'Edit Student';
        const existingStudent = this.userService.getUserById(id);
        this.student = existingStudent ? JSON.parse(JSON.stringify(existingStudent)) : null;
        
        // Load existing profile picture
        if (this.student?.details?.avatarUrl) {
          this.profilePic = this.student.details.avatarUrl;
        }
      } else {
        this.isEditMode = false;
        this.pageTitle = 'Add Student';
        // Generate next student ID
        const nextId = this.generateNextStudentId();
        this.student = {
          id: nextId,
          _id: nextId,
          firstName: '',
          middleName: '',
          lastName: '',
          email: '',
          role: 'S',
          password: 'password123',
          details: {
            departmentId: '',
            degree: '',
            mobile: '',
            dob: '',
            classId: '',
            rollNo: '',
            prn: '',
            guardianNo: '',
            avatarUrl: '',
            fees: { total: 0, paid: 0, due: 0 }
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

  generateNextStudentId(): string {
    const students = this.userService.getStudents();
    
    if (students.length === 0) {
      return 'S00001';
    }
    
    // Find highest student ID
    const ids = students.map(s => {
      const id = s.id || s._id || '';
      return parseInt(id.substring(1));
    });
    
    const maxId = Math.max(...ids);
    const nextId = maxId + 1;
    
    return 'S' + nextId.toString().padStart(5, '0');
  }

  onProfilePicChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
     
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

  saveStudent() {
    if (this.student) {
      // Build name field
      this.student.name = `${this.student.firstName} ${this.student.middleName || ''} ${this.student.lastName}`.trim();
      
      // Save profile picture to avatarUrl
      if (this.profilePic) {
        this.student.details.avatarUrl = this.profilePic as string;
      }
      
      console.log('Saving student:', this.student);
      
      if (this.isEditMode) {
        const originalStudent = this.userService.getUserById(this.student.id || this.student._id || '');
        if (originalStudent && originalStudent.details?.classId !== this.student.details?.classId) {
          this.userService.reassignStudent(
            this.student.id || this.student._id || '',
            originalStudent.details.classId,
            this.student.details.classId
          );
        }
        
        this.userService.updateUser(this.student);
       
      } else {
        this.userService.addUser(this.student);
        
        // Wait a bit then navigate
        setTimeout(() => {
          this.router.navigate(['/admin/manage-students']);
        }, 300);
        return;
      }
      
      this.router.navigate(['/admin/manage-students']);
    } else {
      alert('Please fill in all required fields');
    }
  }
}
