
import { Component, ChangeDetectionStrategy, inject, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TestService, Test } from '../../services/test.service';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-take-test',
  imports: [CommonModule, FormsModule],
  templateUrl: './take-test.component.html',
  styleUrls: ['./take-test.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TakeTestComponent implements OnInit, OnDestroy {
  route: ActivatedRoute = inject(ActivatedRoute);
  router: Router = inject(Router);
  testService = inject(TestService);
  authService = inject(AuthService);
  cdr = inject(ChangeDetectorRef);

  test: Test | null = null;
  currentQuestionIndex = 0;
  answers: { [key: number]: number } = {};  // Changed to number for answer index
  
  private routeSub!: Subscription;

  ngOnInit(): void {
    this.routeSub = this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.test = this.testService.getTestById(id);
        this.cdr.markForCheck();
      }
    });
  }

  ngOnDestroy(): void {
    this.routeSub.unsubscribe();
  }

  get currentQuestion() {
    return this.test!.questions[this.currentQuestionIndex];
  }

  nextQuestion() {
    if (this.test && this.currentQuestionIndex < this.test.questions.length - 1) {
      this.currentQuestionIndex++;
      this.cdr.markForCheck();
    }
  }

  prevQuestion() {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
      this.cdr.markForCheck();
    }
  }

  submitTest() {
    const studentId = this.authService.currentUserValue?.id;
    if (this.test && studentId) {
      // Calculate score
      let score = 0;
      let totalMarks = 0;
      
      this.test.questions.forEach((q, index) => {
        totalMarks += q.marks;
        if (this.answers[index] === q.correctAnswer) {
          score += q.marks;
        }
      });

      // Fixed: Call submitTest with single submission object
      this.testService.submitTest({
        testId: this.test.id || this.test._id || '',
        studentId: studentId,
        answers: this.answers,
        score: score,
        totalMarks: totalMarks,
        submittedAt: new Date()
      });
      
      alert('Test submitted successfully!');
      this.router.navigate(['/student/tests']);
    } else {
      alert('An error occurred. Could not submit test.');
    }
  }
}
