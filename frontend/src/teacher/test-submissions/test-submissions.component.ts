
import { Component, ChangeDetectionStrategy, ChangeDetectorRef, inject, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TestService, Test, TestSubmission } from '../../services/test.service';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

interface SubmissionDetail extends TestSubmission {
    studentName: string;
}

@Component({
  selector: 'app-test-submissions',
  imports: [CommonModule, RouterLink],
  templateUrl: './test-submissions.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestSubmissionsComponent implements OnInit, OnDestroy {
  // FIX: Explicitly type injected ActivatedRoute.
  route: ActivatedRoute = inject(ActivatedRoute);
  testService = inject(TestService);
  userService = inject(UserService);
  cdr = inject(ChangeDetectorRef);

  test: Test | null = null;
  submissionDetails: SubmissionDetail[] = [];
  averageScore = 0;
  totalTestMarks = 0;
  
  private routeSub!: Subscription;
  private dataSub = new Subscription();
  private latestTestId = '';

  ngOnInit(): void {
    this.routeSub = this.route.params.subscribe(params => {
      const testId = params['id'];
      if (testId) {
        this.latestTestId = testId;
        this.dataSub.unsubscribe();
        this.dataSub = new Subscription();

        this.dataSub.add(this.testService.getTestByIdObservable(testId).subscribe(test => {
          this.test = test || null;
          this.totalTestMarks = this.test ? this.test.questions.reduce((acc, q) => acc + q.marks, 0) : 0;
          this.refreshSubmissionDetails();
        }));

        this.dataSub.add(this.testService.getSubmissionsForTestObservable(testId).subscribe(() => {
          this.refreshSubmissionDetails();
        }));

        this.dataSub.add(this.userService.getUsersObservable().subscribe(() => {
          this.refreshSubmissionDetails();
        }));
      }
    });
  }

  ngOnDestroy(): void {
    this.routeSub.unsubscribe();
    this.dataSub.unsubscribe();
  }

  private refreshSubmissionDetails(): void {
    if (!this.latestTestId) {
      return;
    }

    const submissions = this.testService.getSubmissionsForTest(this.latestTestId);
    const studentIds = submissions.map(s => s.studentId);
    const students = this.userService.getUsersByIds(studentIds);

    this.submissionDetails = submissions.map(sub => {
      const student = students.find(s => s.id === sub.studentId);
      return {
        ...sub,
        studentName: student ? `${student.firstName} ${student.lastName}` : 'Unknown Student'
      };
    }).sort((a, b) => b.score - a.score);

    this.averageScore = this.submissionDetails.length > 0
      ? this.submissionDetails.reduce((acc, sub) => acc + sub.score, 0) / this.submissionDetails.length
      : 0;

    this.cdr.markForCheck();
  }
}
