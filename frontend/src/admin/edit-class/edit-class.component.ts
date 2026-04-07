
import { Component, ChangeDetectionStrategy, ChangeDetectorRef, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ClassService } from '../../services/class.service';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

import { DepartmentService } from '../../services/department.service';
import { Department } from '../../models/department';

@Component({
  selector: 'app-edit-class',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './edit-class.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditClassComponent implements OnInit {
  // FIX: Explicitly type injected ActivatedRoute and Router.
  route: ActivatedRoute = inject(ActivatedRoute);
  router: Router = inject(Router);
  classService = inject(ClassService);
  userService = inject(UserService);
  departmentService = inject(DepartmentService);
  cdr = inject(ChangeDetectorRef);

  isSaving = false;

  classData: any = null;
  isEditMode = false;
  pageTitle = 'Add Class';
  
  allTeachers: User[] = [];
  allStudents: User[] = [];
  departments: Department[] = [];
  
  days = ['mon', 'tue', 'wed', 'thu', 'fri'];
  dayHeaders = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  timeSlots = ["09:00 - 10:00", "10:00 - 11:00", "11:00 - 12:00", "12:00 - 01:00"];

  private routeSub!: Subscription;

  ngOnInit(): void {
    this.allTeachers = this.userService.getTeachers();
    this.departments = this.departmentService.getDepartments();
    
    this.routeSub = this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.isEditMode = true;
        this.pageTitle = 'Edit Class';
        const existingClass = this.classService.getClassById(id);
        this.classData = existingClass ? JSON.parse(JSON.stringify(existingClass)) : null;
        if (this.classData && (!this.classData.timeTable || this.classData.timeTable.length === 0)) {
           this.initializeTimeTable();
        }
      } else {
        this.isEditMode = false;
        this.pageTitle = 'Add Class';
        this.classData = { customClassId: '', id: '', name: '', departmentId: '', teacherIds: [], studentIds: [], subjects: [], timeTable: [] };
        this.initializeTimeTable();
      }

      // Filter students to show only unassigned ones + those in the current class
      const allStudentsFromService = this.userService.getStudents();
      const allClasses = this.classService.getClasses();
      const currentClassId = (this.isEditMode && this.classData) ? this.classData.id : null;

      const assignedStudentIdsInOtherClasses = new Set<string>();
      allClasses.forEach(c => {
        if (c.id !== currentClassId) {
          c.studentIds.forEach((studentId: string) => assignedStudentIdsInOtherClasses.add(studentId));
        }
      });
      
      this.allStudents = allStudentsFromService.filter(student => !assignedStudentIdsInOtherClasses.has(student.id));
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy(): void {
    this.routeSub.unsubscribe();
  }

  getSubjectsForSelectedTeachers(): any[] {
    return this.classData.subjects.filter((subject: any) => this.classData.teacherIds.includes(subject.teacherId));
  }

  initializeTimeTable() {
    if (!this.classData.timeTable || this.classData.timeTable.length === 0) {
      this.classData.timeTable = this.timeSlots.map(time => ({
        time, mon: '', tue: '', wed: '', thu: '', fri: ''
      }));
    }
  }

  addTimeTableRow() {
    this.classData.timeTable.push({
      time: '00:00 - 00:00', mon: '', tue: '', wed: '', thu: '', fri: ''
    });
  }

  removeTimeTableRow(index: number) {
    this.classData.timeTable.splice(index, 1);
  }

  addSubject() {
    this.classData.subjects.push({ code: '', name: '', teacherId: '', totalMarks: 100, credits: 3 });
  }

  removeSubject(index: number) {
    this.classData.subjects.splice(index, 1);
  }

  isTeacherSelected(teacherId: string): boolean {
    return this.classData.teacherIds.includes(teacherId);
  }

  onTeacherCheck(event: Event, teacherId: string) {
    const input = event.target as HTMLInputElement;
    if (input.checked) {
      if (!this.isTeacherSelected(teacherId)) {
        this.classData.teacherIds.push(teacherId);
      }
    } else {
      const index = this.classData.teacherIds.indexOf(teacherId);
      if (index > -1) {
        this.classData.teacherIds.splice(index, 1);
      }
    }
  }
  
  isStudentSelected(studentId: string): boolean {
    return this.classData.studentIds.includes(studentId);
  }

  onStudentCheck(event: Event, studentId: string) {
    const input = event.target as HTMLInputElement;
    if (input.checked) {
      if (!this.isStudentSelected(studentId)) {
        this.classData.studentIds.push(studentId);
      }
    } else {
      const index = this.classData.studentIds.indexOf(studentId);
      if (index > -1) {
        this.classData.studentIds.splice(index, 1);
      }
    }
  }

  saveClass() {
    if (this.isSaving) return;
    this.isSaving = true;
    const payload = { ...this.classData };
    // Map customClassId -> classId for the backend
    if (!this.isEditMode) {
      payload.classId = this.classData.customClassId || '';
    }
    if (this.isEditMode) {
      this.classService.updateClass(payload).subscribe({
        next: () => {
          this.isSaving = false;
          alert('Class updated successfully!');
          this.router.navigate(['/admin/manage-classes']);
        },
        error: (err) => {
          this.isSaving = false;
          alert('Error updating class: ' + (err.error?.message || err.message));
        }
      });
    } else {
      this.classService.addClass(payload).subscribe({
        next: () => {
          this.isSaving = false;
          alert('Class added successfully!');
          this.router.navigate(['/admin/manage-classes']);
        },
        error: (err) => {
          this.isSaving = false;
          alert('Error adding class: ' + (err.error?.message || err.message));
        }
      });
    }
  }
}
