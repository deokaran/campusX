import { Component, ChangeDetectionStrategy, inject, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TestService, Question } from '../../services/test.service';
import { ClassService } from '../../services/class.service';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-create-test',
  imports: [CommonModule, FormsModule],
  templateUrl: './create-test.component.html',
  styleUrls: ['./create-test.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateTestComponent implements OnInit, OnDestroy {
  testService = inject(TestService);
  classService = inject(ClassService);
  authService = inject(AuthService);
  cdr = inject(ChangeDetectorRef);

  myClasses: any[] = [];
  subjects: any[] = [];
  currentStep = 1;
  private classesSub?: Subscription;

  test = {
    title: '',
    subject: '',
    classId: '',
    createdBy: '',
    status: 'Draft',
    resultsPublished: false
  };
  
  // Fixed: correctAnswer is now number (index 0-3)
  questions: Question[] = [{ 
    question: '', 
    options: ['', '', '', ''], 
    correctAnswer: 0, 
    marks: 10 
  }];

  ngOnInit() {
    const teacherId = this.authService.currentUserValue?.id || '';
    this.classesSub = this.classService.getClassesObservable().subscribe(classes => {
      this.myClasses = classes.filter(c => this.classService.isTeacherAssignedToClass(c, teacherId));

      if (!this.myClasses.length) {
        this.test.classId = '';
        this.test.subject = '';
        this.subjects = [];
        this.cdr.markForCheck();
        return;
      }

      const stillSelected = this.myClasses.some(c => c.id === this.test.classId);
      const nextClassId = stillSelected ? this.test.classId : (this.myClasses[0].id || '');
      this.onClassChange(nextClassId);
    });
  }

  ngOnDestroy(): void {
    this.classesSub?.unsubscribe();
  }

  onClassChange(classId: string) {
    this.test.classId = classId;
    this.subjects = this.classService.getSubjectsForClass(classId);
    this.test.subject = this.subjects.length > 0 ? this.subjects[0].code : '';
    this.cdr.markForCheck();
  }

  addQuestion() {
    // Fixed: correctAnswer is number
    this.questions.push({ 
      question: '', 
      options: ['', '', '', ''], 
      correctAnswer: 0, 
      marks: 10 
    });
    this.cdr.markForCheck();
  }

  removeQuestion(index: number) {
    this.questions.splice(index, 1);
    this.cdr.markForCheck();
  }

  proceedToStep2() {
    this.currentStep = 2;
    this.cdr.markForCheck();
  }

  backToStep1() {
    this.currentStep = 1;
    this.cdr.markForCheck();
  }
  
  getClassName(classId: string): string {
    return this.myClasses.find(c => c.id === classId)?.name || 'N/A';
  }

  getSubjectName(subjectCode: string): string {
    const classSubjects = this.classService.getSubjectsForClass(this.test.classId);
    return classSubjects.find(s => s.code === subjectCode)?.name || 'N/A';
  }

  createTest() {
    this.test.createdBy = this.authService.currentUserValue?.id || '';
    const testPayload = { ...this.test, questions: this.questions };
    this.testService.saveTest(testPayload).subscribe({
      next: () => {
        alert('Test created successfully!');
        this.test = { 
          title: '', 
          subject: this.subjects[0]?.code || '', 
          classId: this.myClasses[0]?.id || '', 
          createdBy: '', 
          status: 'Draft', 
          resultsPublished: false 
        };
        this.questions = [{ 
          question: '', 
          options: ['', '', '', ''], 
          correctAnswer: 0, 
          marks: 10 
        }];
        this.currentStep = 1;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error creating test:', error);
        alert('Error creating test: ' + (error.error?.message || error.message));
      }
    });
  }
}
