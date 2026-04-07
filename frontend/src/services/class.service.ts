import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ClassData {
  id?: string;
  _id?: string;
  name: string;
  departmentId: string;
  teacherIds: string[];
  studentIds: string[];
  subjects: any[];
  timeTable: any[];
}

@Injectable({
  providedIn: 'root'
})
export class ClassService {
  private apiUrl = 'http://localhost:5000/api/classes';
  private classesSubject = new BehaviorSubject<ClassData[]>([]);
  public classes$ = this.classesSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadClasses();
  }

  private loadClasses(): void {
    this.http.get<ClassData[]>(this.apiUrl).subscribe(
      classes => this.classesSubject.next(classes),
      error => console.error('Error loading classes:', error)
    );
  }

  // BACKWARD COMPATIBLE SYNCHRONOUS METHODS
  getClasses(): ClassData[] {
    return this.classesSubject.getValue();
  }
  
  getClassById(id: string): ClassData | undefined {
    return this.classesSubject.getValue().find(c => (c.id || c._id) === id);
  }

  // OBSERVABLE METHODS FOR REACTIVE COMPONENTS
  getClassesObservable(): Observable<ClassData[]> {
    return this.classes$;
  }

  getStudentsByClass(classId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${classId}/students`);
  }
  
  getSubjectsForClass(classId: string): any[] {
    const classData = this.getClassById(classId);
    return classData?.subjects || [];
  }

  addClass(classData: ClassData): void {
    this.http.post<ClassData>(this.apiUrl, classData).subscribe({
      next: (newClass) => {
        const currentClasses = this.classesSubject.getValue();
        this.classesSubject.next([...currentClasses, newClass]);
      },
      error: (error) => console.error('Error adding class:', error)
    });
  }

  updateClass(classData: ClassData): void {
    const classId = classData.id || classData._id;
    this.http.put<ClassData>(`${this.apiUrl}/${classId}`, classData).subscribe({
      next: (updatedClass) => {
        const currentClasses = this.classesSubject.getValue();
        const index = currentClasses.findIndex(c => (c.id || c._id) === classId);
        if (index !== -1) {
          currentClasses[index] = updatedClass;
          this.classesSubject.next([...currentClasses]);
        }
      },
      error: (error) => console.error('Error updating class:', error)
    });
  }

  deleteClass(classId: string): void {
    this.http.delete<void>(`${this.apiUrl}/${classId}`).subscribe({
      next: () => {
        const currentClasses = this.classesSubject.getValue();
        this.classesSubject.next(currentClasses.filter(c => (c.id || c._id) !== classId));
      },
      error: (error) => console.error('Error deleting class:', error)
    });
  }

  removeStudentFromAllClasses(studentId: string): void {
    const classes = this.getClasses();
    classes.forEach(c => {
      const index = c.studentIds.indexOf(studentId);
      if (index > -1) {
        c.studentIds.splice(index, 1);
        this.updateClass(c);
      }
    });
  }
}
