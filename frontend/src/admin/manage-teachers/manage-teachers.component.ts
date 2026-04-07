import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DepartmentService } from '../../services/department.service';
import { Department } from '../../models/department';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-manage-teachers',
  imports: [CommonModule, RouterLink],
  templateUrl: './manage-teachers.component.html'
})
export class ManageTeachersComponent implements OnInit, OnDestroy {
  teachers: User[] = [];
  departments: Department[] = [];
  private subscriptions: Subscription[] = [];
  
  constructor(
    private userService: UserService,
    private departmentService: DepartmentService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Subscribe to users observable for reactive updates
    const usersSub = this.userService.getUsersObservable().subscribe(users => {
      this.teachers = users.filter(u => u.role === 'T');
      console.log('Teachers loaded:', this.teachers);
      this.cdr.markForCheck();
    });
    this.subscriptions.push(usersSub);
    
    // Subscribe to departments
    const deptSub = this.departmentService.departments$.subscribe(depts => {
      this.departments = depts;
      console.log('Departments loaded:', this.departments);
      this.cdr.markForCheck();
    });
    this.subscriptions.push(deptSub);
  }

  ngOnDestroy() {
    // Clean up subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  getDepartmentName(id: string): string {
    if (!id) return 'Not Assigned';
    const dept = this.departments.find(d => (d.id || d._id) === id);
    return dept ? dept.name : 'Unknown';
  }

  getTeacherId(teacher: User): string {
    return teacher.id || teacher._id || 'N/A';
  }

  getTeacherName(teacher: User): string {
    // If name field exists, use it
    if (teacher.name) {
      return teacher.name;
    }
    
    // Otherwise build from firstName, middleName, lastName
    const parts = [
      teacher.firstName || '',
      teacher.middleName || '',
      teacher.lastName || ''
    ].filter(p => p.trim());
    
    return parts.join(' ') || 'N/A';
  }

  deleteTeacher(teacher: User) {
    const teacherId = this.getTeacherId(teacher);
    const teacherName = this.getTeacherName(teacher);
    
    if (confirm(`Are you sure you want to delete teacher ${teacherName} (${teacherId})?`)) {
      this.userService.deleteUser(teacherId);
    }
  }
}