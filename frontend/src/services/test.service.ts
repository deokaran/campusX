import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

export interface Question {
  id?: string;
  question: string;
  options: string[];
  correctAnswer: number;  // Index of correct answer (0-3)
  marks: number;
  explanation?: string;
}

export interface Test {
  _id?: string;
  id?: string;
  title: string;
  subject: string;
  classId: string;
  createdBy: string;
  status: string;
  resultsPublished: boolean;
  questions: Question[];
}

export interface TestSubmission {
  _id?: string;
  id?: string;
  testId: string;
  studentId: string;
  answers: any;
  score: number;
  totalMarks: number;
  submittedAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class TestService {
  private apiUrl = 'http://localhost:5000/api/tests';
  private submissionsApiUrl = 'http://localhost:5000/api/submissions';

  private testsSubject = new BehaviorSubject<Test[]>([]);
  public tests$ = this.testsSubject.asObservable();

  private submissionsSubject = new BehaviorSubject<TestSubmission[]>([]);
  public submissions$ = this.submissionsSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadTests();
    this.loadSubmissions();
  }

  private normalizeTest(test: Test): Test {
    const normalizedId = test._id || test.id || '';

    return {
      ...test,
      _id: normalizedId,
      id: normalizedId
    };
  }

  private normalizeSubmission(submission: TestSubmission): TestSubmission {
    const normalizedId = submission._id || submission.id || '';

    return {
      ...submission,
      _id: normalizedId,
      id: normalizedId
    };
  }

  private loadTests(): void {
    this.http.get<Test[]>(this.apiUrl).subscribe(
      tests => this.testsSubject.next(tests.map(test => this.normalizeTest(test))),
      error => console.error('Error loading tests:', error)
    );
  }

  private loadSubmissions(): void {
    this.http.get<TestSubmission[]>(this.submissionsApiUrl).subscribe(
      submissions => this.submissionsSubject.next(submissions.map(submission => this.normalizeSubmission(submission))),
      error => console.error('Error loading submissions:', error)
    );
  }
  
  saveTest(testData: any): Observable<Test> {
    return this.http.post<Test>(this.apiUrl, testData).pipe(
      map(test => this.normalizeTest(test)),
      tap((newTest) => {
        const currentTests = this.testsSubject.getValue();
        this.testsSubject.next([...currentTests, newTest]);
      })
    );
  }
  
  getTeacherTests(teacherId: string): Observable<Test[]> {
    return this.tests$.pipe(
      map(tests => tests.filter(t => t.createdBy === teacherId))
    );
  }
  
  getTestsForClass(classId: string): Observable<Test[]> {
    return this.tests$.pipe(
      map(tests => tests.filter(t => t.classId === classId && String(t.status || '').toLowerCase() !== 'draft'))
    );
  }

  // BACKWARD COMPATIBLE SYNCHRONOUS METHOD
  getTestById(testId: string): Test | undefined {
    return this.testsSubject.getValue().find(t => (t._id || t.id) === testId);
  }

  // OBSERVABLE METHOD
  getTestByIdObservable(testId: string): Observable<Test | undefined> {
    return this.http.get<Test>(`${this.apiUrl}/${testId}`).pipe(
      map(test => this.normalizeTest(test))
    );
  }

  submitTest(submission: Partial<TestSubmission>): Observable<TestSubmission> {
    return this.http.post<TestSubmission>(this.submissionsApiUrl, submission).pipe(
      map(newSubmission => this.normalizeSubmission(newSubmission)),
      tap((newSubmission) => {
        const currentSubmissions = this.submissionsSubject.getValue();
        this.submissionsSubject.next([...currentSubmissions, newSubmission]);
      })
    );
  }

  // BACKWARD COMPATIBLE SYNCHRONOUS METHOD
  getSubmission(testId: string, studentId: string): TestSubmission | undefined {
    return this.submissionsSubject.getValue().find(s => s.testId === testId && s.studentId === studentId);
  }

  // OBSERVABLE METHOD
  getSubmissionObservable(testId: string, studentId: string): Observable<TestSubmission | undefined> {
    return this.submissions$.pipe(
      map(submissions => submissions.find(s => s.testId === testId && s.studentId === studentId))
    );
  }

  getSubmissionsForTest(testId: string): TestSubmission[] {
    return this.submissionsSubject.getValue().filter(s => s.testId === testId);
  }

  getSubmissionsForTestObservable(testId: string): Observable<TestSubmission[]> {
    return this.submissions$.pipe(
      map(submissions => submissions.filter(s => s.testId === testId))
    );
  }

  getSubmissions(): Observable<TestSubmission[]> {
    return this.submissions$;
  }
  
  publishTest(testId: string): void {
    this.http.patch<Test>(`${this.apiUrl}/${testId}/publish`, {}).subscribe({
      next: (updatedTest) => {
        const currentTests = this.testsSubject.getValue();
        const index = currentTests.findIndex(t => (t._id || t.id) === testId);
        if (index !== -1) {
          currentTests[index] = this.normalizeTest(updatedTest);
          this.testsSubject.next([...currentTests]);
        }
      },
      error: (error) => console.error('Error publishing test:', error)
    });
  }

  closeTest(testId: string): void {
    this.http.patch<Test>(`${this.apiUrl}/${testId}/close`, {}).subscribe({
      next: (updatedTest) => {
        const currentTests = this.testsSubject.getValue();
        const index = currentTests.findIndex(t => (t._id || t.id) === testId);
        if (index !== -1) {
          currentTests[index] = this.normalizeTest(updatedTest);
          this.testsSubject.next([...currentTests]);
        }
      },
      error: (error) => console.error('Error closing test:', error)
    });
  }

  publishResults(testId: string): void {
    this.http.patch<Test>(`${this.apiUrl}/${testId}/results`, {}).subscribe({
      next: (updatedTest) => {
        const currentTests = this.testsSubject.getValue();
        const index = currentTests.findIndex(t => (t._id || t.id) === testId);
        if (index !== -1) {
          currentTests[index] = this.normalizeTest(updatedTest);
          this.testsSubject.next([...currentTests]);
        }
      },
      error: (error) => console.error('Error publishing results:', error)
    });
  }

  resumeTest(testId: string): void {
    this.http.patch<Test>(`${this.apiUrl}/${testId}/resume`, {}).subscribe({
      next: (updatedTest) => {
        const currentTests = this.testsSubject.getValue();
        const index = currentTests.findIndex(t => (t._id || t.id) === testId);
        if (index !== -1) {
          currentTests[index] = this.normalizeTest(updatedTest);
          this.testsSubject.next([...currentTests]);
        }
      },
      error: (error) => console.error('Error resuming test:', error)
    });
  }

  deleteTest(testId: string): void {
    this.http.delete<void>(`${this.apiUrl}/${testId}`).subscribe({
      next: () => {
        const currentTests = this.testsSubject.getValue();
        this.testsSubject.next(currentTests.filter(t => (t._id || t.id) !== testId));
        
        // Also remove submissions
        const currentSubmissions = this.submissionsSubject.getValue();
        this.submissionsSubject.next(currentSubmissions.filter(s => s.testId !== testId));
      },
      error: (error) => console.error('Error deleting test:', error)
    });
  }

  updateTest(testId: string, testData: Partial<Test>): void {
    this.http.put<Test>(`${this.apiUrl}/${testId}`, testData).subscribe({
      next: (updatedTest) => {
        const currentTests = this.testsSubject.getValue();
        const index = currentTests.findIndex(t => (t._id || t.id) === testId);
        if (index !== -1) {
          currentTests[index] = this.normalizeTest(updatedTest);
          this.testsSubject.next([...currentTests]);
        }
      },
      error: (error) => console.error('Error updating test:', error)
    });
  }
}
