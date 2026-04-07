
import { Component, ChangeDetectionStrategy, inject, OnInit, OnDestroy } from '@angular/core';
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

  test: Test | null = null;
  submissionDetails: SubmissionDetail[] = [];
  averageScore = 0;
  totalTestMarks = 0;
  
  private routeSub!: Subscription;

  ngOnInit(): void {
    this.routeSub = this.route.params.subscribe(params => {
      const testId = params['id'];
      if (testId) {
        this.test = this.testService.getTestById(testId) || null;
        if (this.test) {
          this.totalTestMarks = this.test.questions.reduce((acc, q) => acc + q.marks, 0);
          
          const submissions = this.testService.getSubmissionsForTest(this.test.id);
          const studentIds = submissions.map(s => s.studentId);
          const students = this.userService.getUsersByIds(studentIds);
          
          this.submissionDetails = submissions.map(sub => {
              const student = students.find(s => s.id === sub.studentId);
              return {
                  ...sub,
                  studentName: student ? `${student.firstName} ${student.lastName}` : 'Unknown Student'
              };
          }).sort((a, b) => b.score - a.score); // Sort by score descending

          if (this.submissionDetails.length > 0) {
            const totalScore = this.submissionDetails.reduce((acc, sub) => acc + sub.score, 0);
            this.averageScore = totalScore / this.submissionDetails.length;
          }
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.routeSub.unsubscribe();
  }
}