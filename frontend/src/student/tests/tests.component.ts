import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TestService, Test } from '../../services/test.service';
import { ClassService } from '../../services/class.service';
import { AuthService } from '../../services/auth.service';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-tests',
  imports: [CommonModule, RouterLink],
  templateUrl: './tests.component.html',
  styleUrls: ['./tests.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestsComponent implements OnInit {
  availableTests$!: Observable<Test[]>;
  studentId = '';

  constructor(
    private testService: TestService,
    private classService: ClassService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    const student = this.authService.currentUserValue;
    if (student && student.details.classId) {
      this.studentId = student.id;
      this.availableTests$ = this.testService.getTestsForClass(student.details.classId);
    }
  }

  getSubjectName(subjectCode: string): string {
    const student = this.authService.currentUserValue;
    if (student && student.details.classId) {
        const subjects = this.classService.getSubjectsForClass(student.details.classId);
        return subjects.find(s => s.code === subjectCode)?.name || 'N/A';
    }
    return 'N/A';
  }

  hasSubmitted(testId: string): boolean {
    return !!this.testService.getSubmission(testId, this.studentId);
  }
}
