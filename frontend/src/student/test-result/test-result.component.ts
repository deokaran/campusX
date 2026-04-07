
import { Component, ChangeDetectionStrategy, inject, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TestService, Test, TestSubmission } from '../../services/test.service';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-test-result',
  imports: [CommonModule, RouterLink],
  templateUrl: './test-result.component.html',
  styleUrls: ['./test-result.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestResultComponent implements OnInit, OnDestroy {
  // FIX: Explicitly type injected ActivatedRoute.
  route: ActivatedRoute = inject(ActivatedRoute);
  testService = inject(TestService);
  authService = inject(AuthService);

  test: Test | null = null;
  submission: TestSubmission | null = null;
  scorePercentage = 0;
  totalTestMarks = 0;
  
  private routeSub!: Subscription;

  ngOnInit(): void {
    this.routeSub = this.route.params.subscribe(params => {
      const testId = params['id'];
      const studentId = this.authService.currentUserValue?.id;
      if (testId && studentId) {
        this.test = this.testService.getTestById(testId) || null;
        this.submission = this.testService.getSubmission(testId, studentId) || null;

        if (this.test) {
           this.totalTestMarks = this.test.questions.reduce((acc, q) => acc + q.marks, 0);
        }

        if (this.submission && this.submission.totalMarks > 0) {
          this.scorePercentage = Math.round((this.submission.score / this.submission.totalMarks) * 100);
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.routeSub.unsubscribe();
  }

  isCorrect(questionIndex: number): boolean {
    if (!this.test || !this.submission) return false;
    const question = this.test.questions[questionIndex];
    const studentAnswer = this.submission.answers[questionIndex];
    return question.correctAnswer === studentAnswer;
  }
}