import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';

export interface ClassData {
  classId?: string;
  id?: string;
  _id?: string;
  customClassId?: string;
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

  private normalizeClass(classData: ClassData): ClassData {
    const normalizedId = (classData._id || classData.id || classData.classId || '').trim();

    return {
      ...classData,
      classId: normalizedId,
      id: normalizedId,
      _id: normalizedId,
      customClassId: classData.customClassId || '',
      teacherIds: classData.teacherIds || [],
      studentIds: classData.studentIds || [],
      subjects: classData.subjects || [],
      timeTable: classData.timeTable || []
    };
  }

  private loadClasses(): void {
    this.http.get<ClassData[]>(this.apiUrl).subscribe({
      next: (classes) => this.classesSubject.next(classes.map(classData => this.normalizeClass(classData))),
      error: (error) => console.error('Error loading classes:', error)
    });
  }

  getClasses(): ClassData[] {
    return this.classesSubject.getValue();
  }

  getClassesObservable(): Observable<ClassData[]> {
    return this.classes$;
  }

  getClassById(classId: string): ClassData | undefined {
    return this.getClasses().find(c => (c.classId || c.id || c._id) === classId);
  }

  addClass(classData: ClassData): Observable<ClassData> {
    const normalizedClass = this.normalizeClass(classData);
    return this.http.post<ClassData>(this.apiUrl, normalizedClass).pipe(
      tap((newClass) => {
        const current = this.getClasses();
        this.classesSubject.next([...current, this.normalizeClass(newClass)]);
      })
    );
  }

  updateClass(classData: ClassData): Observable<ClassData> {
    const normalizedClass = this.normalizeClass(classData);
    const classId = normalizedClass.classId || normalizedClass._id || normalizedClass.id;
    return this.http.put<ClassData>(
      `${this.apiUrl}/${classId}`,
      normalizedClass
    ).pipe(
      tap((updated) => {
        const normalizedUpdated = this.normalizeClass(updated);
        const updatedList = this.getClasses().map(c =>
          (c.classId || c.id || c._id) === normalizedUpdated.classId ? normalizedUpdated : c
        );
        this.classesSubject.next(updatedList);
      })
    );
  }

  deleteClass(classId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${classId}`).pipe(
      tap(() => {
        this.classesSubject.next(
          this.getClasses().filter(c => (c.classId || c.id || c._id) !== classId)
        );
      })
    );
  }

  refresh() {
    this.loadClasses();
  }

  getSubjectsForClass(classId: string): any[] {
    const classData = this.getClassById(classId);
    return classData?.subjects || [];
  }

  getStudentsByClass(classId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${classId}/students`);
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
