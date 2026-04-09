import { Component, ChangeDetectionStrategy, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TestService, Test } from '../../services/test.service';
import { ClassService } from '../../services/class.service';
import { AuthService } from '../../services/auth.service';
import { RouterLink } from '@angular/router';
import { Observable, Subscription, of } from 'rxjs';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-tests',
  imports: [CommonModule, RouterLink],
  templateUrl: './tests.component.html',
  styleUrls: ['./tests.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestsComponent implements OnInit, OnDestroy {
  availableTests$: Observable<Test[]> = of([]);
  studentId = '';
  currentClassId = '';
  subjects: any[] = [];
  private classesSub?: Subscription;
  private submissionsSub?: Subscription;

  constructor(
    private testService: TestService,
    private classService: ClassService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const student = this.authService.currentUserValue;
    if (student) {
      this.studentId = student.id;
      this.currentClassId = student.details?.classId || '';
      this.availableTests$ = this.currentClassId
        ? this.testService.getTestsForClass(this.currentClassId)
        : of([]);
    }

    this.classesSub = this.classService.getClassesObservable().subscribe(() => {
      this.subjects = this.currentClassId
        ? this.classService.getSubjectsForClass(this.currentClassId)
        : [];
      this.cdr.markForCheck();
    });

    this.submissionsSub = this.testService.submissions$.subscribe(() => {
      this.cdr.markForCheck();
    });
  }

  getSubjectName(subjectCode: string): string {
    return this.subjects.find(s => s.code === subjectCode)?.name || 'N/A';
  }

  hasSubmitted(testId: string): boolean {
    return !!this.testService.getSubmission(testId, this.studentId);
  }

  ngOnDestroy(): void {
    this.classesSub?.unsubscribe();
    this.submissionsSub?.unsubscribe();
  }
}
