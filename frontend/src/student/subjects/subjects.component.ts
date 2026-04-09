
import { Component, ChangeDetectionStrategy, ChangeDetectorRef, inject, OnDestroy, OnInit } from '@angular/core';
import { ClassService } from '../../services/class.service';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-subjects',
  imports: [CommonModule],
  templateUrl: './subjects.component.html',
  styleUrls: ['./subjects.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SubjectsComponent implements OnInit, OnDestroy {
  classService = inject(ClassService);
  userService = inject(UserService);
  authService = inject(AuthService);
  cdr = inject(ChangeDetectorRef);
  subjects: any[] = [];
  private currentClassId = '';
  private subscriptions = new Subscription();

  ngOnInit() {
    this.subscriptions.add(this.authService.currentUser$.subscribe(student => {
      this.currentClassId = student?.details?.classId || '';
      this.loadSubjects();
    }));
    this.subscriptions.add(this.classService.getClassesObservable().subscribe(() => {
      this.loadSubjects();
    }));
    this.subscriptions.add(this.userService.getUsersObservable().subscribe(() => {
      this.cdr.markForCheck();
    }));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private loadSubjects() {
    this.subjects = this.currentClassId
      ? this.classService.getSubjectsForClass(this.currentClassId)
      : [];
    this.cdr.markForCheck();
  }

  getTeacherName(teacherId: string): string {
    const teacher = this.userService.getUserById(teacherId);
    return teacher ? `${teacher.firstName} ${teacher.lastName}` : 'N/A';
  }
}
