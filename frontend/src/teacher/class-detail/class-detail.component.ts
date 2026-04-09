
import { Component, ChangeDetectionStrategy, ChangeDetectorRef, inject, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ClassService } from '../../services/class.service';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { User } from '../../models/user';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-class-detail',
  imports: [CommonModule, RouterLink],
  templateUrl: './class-detail.component.html',
  styleUrls: ['./class-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClassDetailComponent implements OnInit, OnDestroy {
  // FIX: Explicitly type injected ActivatedRoute.
  route: ActivatedRoute = inject(ActivatedRoute);
  classService = inject(ClassService);
  userService = inject(UserService);
  cdr = inject(ChangeDetectorRef);

  classData: any = null;
  students: User[] = [];
  
  days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  dayKeys = ['mon', 'tue', 'wed', 'thu', 'fri'];

  private routeSub!: Subscription;
  private classesSub?: Subscription;
  private usersSub?: Subscription;
  private classId = '';

  ngOnInit(): void {
    this.routeSub = this.route.params.subscribe(params => {
      this.classId = params['classId'] || '';
      this.loadClassData();
    });

    this.classesSub = this.classService.getClassesObservable().subscribe(() => {
      this.loadClassData();
    });

    this.usersSub = this.userService.getUsersObservable().subscribe(() => {
      this.cdr.markForCheck();
    });
  }

  private loadClassData() {
    if (!this.classId) {
      this.classData = null;
      this.students = [];
      this.cdr.markForCheck();
      return;
    }

    this.classData = this.classService.getClassById(this.classId);

    if (this.classData) {
      this.classService.getStudentsByClass(this.classId).subscribe(students => {
        this.students = students.sort((a, b) => (a.details?.rollNo || 0) - (b.details?.rollNo || 0));
        this.cdr.markForCheck();
      });
    } else {
      this.students = [];
      this.cdr.markForCheck();
    }
  }

  ngOnDestroy(): void {
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
    this.classesSub?.unsubscribe();
    this.usersSub?.unsubscribe();
  }

  getTeacherName(teacherId: string): string {
    const teacher = this.userService.getUserById(teacherId);
    return teacher ? `${teacher.firstName} ${teacher.lastName}` : 'N/A';
  }

  getFeeStatus(student: User): 'Paid' | 'Pending' {
    if (student.details?.fees?.due > 0) {
      return 'Pending';
    }
    return 'Paid';
  }

  getSubjectName(code: string): string {
    if (!code) return '';
    if (code === 'BREAK') return 'BREAK';
    if (!this.classData || !this.classData.subjects) return code;
    
    const subject = this.classData.subjects.find((s: any) => s.code === code);
    return subject ? subject.name : code;
  }
}
