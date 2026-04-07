import { Component, ChangeDetectionStrategy, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TestService, Question } from '../../services/test.service';
import { ClassService } from '../../services/class.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-create-test',
  imports: [CommonModule, FormsModule],
  templateUrl: './create-test.component.html',
  styleUrls: ['./create-test.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateTestComponent implements OnInit {
  testService = inject(TestService);
  classService = inject(ClassService);
  authService = inject(AuthService);
  cdr = inject(ChangeDetectorRef);

  myClasses: any[] = [];
  subjects: any[] = [];
  currentStep = 1;

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
    this.myClasses = this.classService.getClasses().filter(c => c.teacherIds.includes(teacherId));
    if (this.myClasses.length > 0) {
      this.test.classId = this.myClasses[0].id;
      this.onClassChange(this.myClasses[0].id);
    }
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
    this.testService.saveTest(testPayload);
    
    alert('Test created successfully!');
    // Reset form
    this.test = { 
      title: '', 
      subject: this.subjects[0]?.code || '', 
      classId: this.myClasses[0]?.id || '', 
      createdBy: '', 
      status: 'Draft', 
      resultsPublished: false 
    };
    // Fixed: correctAnswer is number
    this.questions = [{ 
      question: '', 
      options: ['', '', '', ''], 
      correctAnswer: 0, 
      marks: 10 
    }];
    this.currentStep = 1;
    this.cdr.markForCheck();
  }
}
