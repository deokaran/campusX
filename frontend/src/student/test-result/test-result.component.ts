
import { Component, ChangeDetectionStrategy, ChangeDetectorRef, inject, OnInit, OnDestroy } from '@angular/core';
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
  cdr = inject(ChangeDetectorRef);

  test: Test | null = null;
  submission: TestSubmission | null = null;
  scorePercentage = 0;
  totalTestMarks = 0;
  
  private routeSub!: Subscription;
  private dataSub = new Subscription();

  ngOnInit(): void {
    this.routeSub = this.route.params.subscribe(params => {
      const testId = params['id'];
      const studentId = this.authService.currentUserValue?.id;
      if (testId && studentId) {
        this.dataSub.unsubscribe();
        this.dataSub = new Subscription();

        this.dataSub.add(this.testService.getTestByIdObservable(testId).subscribe(test => {
          this.test = test || null;
          this.totalTestMarks = this.test
            ? this.test.questions.reduce((acc, q) => acc + q.marks, 0)
            : 0;
          this.cdr.markForCheck();
        }));

        this.dataSub.add(this.testService.getSubmissionObservable(testId, studentId).subscribe(submission => {
          this.submission = submission || null;
          this.scorePercentage = this.submission && this.submission.totalMarks > 0
            ? Math.round((this.submission.score / this.submission.totalMarks) * 100)
            : 0;
          this.cdr.markForCheck();
        }));
      }
    });
  }

  ngOnDestroy(): void {
    this.routeSub.unsubscribe();
    this.dataSub.unsubscribe();
  }

  isCorrect(questionIndex: number): boolean {
    if (!this.test || !this.submission) return false;
    const question = this.test.questions[questionIndex];
    const studentAnswer = this.submission.answers[questionIndex];
    if (typeof question.correctAnswer === 'number') {
      return Number(studentAnswer) === question.correctAnswer;
    }

    const answerIndex = Number(studentAnswer);
    const selectedAnswer = Number.isFinite(answerIndex) ? question.options[answerIndex] : studentAnswer;
    return question.correctAnswer === selectedAnswer;
  }

  getAnswerLabel(questionIndex: number): string {
    if (!this.test || !this.submission) return 'Not Answered';

    const question = this.test.questions[questionIndex];
    const answerIndex = this.submission.answers[questionIndex];
    if (typeof answerIndex === 'number') {
      return question.options[answerIndex] || 'Not Answered';
    }

    const numericAnswerIndex = Number(answerIndex);
    if (Number.isFinite(numericAnswerIndex) && question.options[numericAnswerIndex]) {
      return question.options[numericAnswerIndex];
    }

    return typeof answerIndex === 'string' ? answerIndex : 'Not Answered';
  }

  getCorrectAnswerLabel(questionIndex: number): string {
    if (!this.test) return 'N/A';

    const question = this.test.questions[questionIndex];
    if (typeof question.correctAnswer === 'number') {
      return question.options[question.correctAnswer] || 'N/A';
    }

    return question.correctAnswer || 'N/A';
  }
}
