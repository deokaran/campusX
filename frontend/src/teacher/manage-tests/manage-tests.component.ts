
import { Component, ChangeDetectionStrategy, inject, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TestService, Test } from '../../services/test.service';
import { ClassService } from '../../services/class.service';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-manage-tests',
  imports: [CommonModule, RouterLink],
  templateUrl: './manage-tests.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ManageTestsComponent implements OnInit, OnDestroy {
  testService = inject(TestService);
  classService = inject(ClassService);
  authService = inject(AuthService);
  cdr = inject(ChangeDetectorRef);
  
  myTests: Test[] = [];
  testToDelete: Test | null = null;
  private testsSub!: Subscription;

  ngOnInit() {
    const teacherId = this.authService.currentUserValue?.id || '';
    this.testsSub = this.testService.getTeacherTests(teacherId).subscribe(tests => {
      this.myTests = tests;
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy(): void {
    if (this.testsSub) {
      this.testsSub.unsubscribe();
    }
  }

  getClassName(classId: string): string {
    return this.classService.getClassById(classId)?.name || 'N/A';
  }

  getSubmissionCount(testId: string): number {
    return this.testService.getSubmissionsForTest(testId).length;
  }

  publishTest(test: Test) {
    this.testService.publishTest(test._id || test.id);
  }
  
  closeTest(test: Test) {
    this.testService.closeTest(test._id || test.id);
  }

  revealResults(test: Test) {
    this.testService.publishResults(test._id || test.id);
  }

  resumeTest(test: Test) {
    this.testService.resumeTest(test._id || test.id);
  }

  selectTestForDeletion(test: Test): void {
    this.testToDelete = test;
  }

  confirmDelete(): void {
    if (this.testToDelete) {
      this.testService.deleteTest(this.testToDelete._id || this.testToDelete.id);
      this.testToDelete = null;
    }
  }
}
