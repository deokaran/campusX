import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Department } from '../models/department';

@Injectable({
  providedIn: 'root'
})
export class DepartmentService {
  private apiUrl = 'http://localhost:5000/api/departments';
  private departmentsSubject = new BehaviorSubject<Department[]>([]);
  public departments$ = this.departmentsSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadDepartments();
  }

  private normalizeDepartment(department: Department): Department {
    const normalizedId = department.id || department._id || '';

    return {
      ...department,
      id: normalizedId,
      _id: normalizedId
    };
  }

  private loadDepartments(): void {
    this.http.get<Department[]>(this.apiUrl).subscribe({
      next: (departments) => {
        console.log('Loaded departments from backend:', departments);
        this.departmentsSubject.next(departments.map(department => this.normalizeDepartment(department)));
      },
      error: (error) => console.error('Error loading departments:', error)
    });
  }

  // BACKWARD COMPATIBLE SYNCHRONOUS METHODS
  getDepartments(): Department[] {
    return this.departmentsSubject.getValue();
  }

  getDepartmentById(id: string): Department | undefined {
    return this.departmentsSubject.getValue().find(d => (d.id || d._id) === id);
  }

  // OBSERVABLE METHODS FOR REACTIVE COMPONENTS
  getDepartmentsObservable(): Observable<Department[]> {
    return this.departments$;
  }

  addDepartment(department: Partial<Department>): Observable<Department> {
    console.log('Adding department:', department);
    
    return this.http.post<Department>(this.apiUrl, department).pipe(
      tap({
        next: (newDept) => {
          console.log('Department added successfully:', newDept);
          const currentDepts = this.departmentsSubject.getValue();
          this.departmentsSubject.next([...currentDepts, this.normalizeDepartment(newDept)]);
        },
        error: (error) => console.error('Error adding department:', error)
      })
    );
  }

  updateDepartment(updatedDepartment: Department): Observable<Department> {
    const deptId = updatedDepartment.id || updatedDepartment._id;
    console.log('Updating department:', deptId, updatedDepartment);
    
    return this.http.put<Department>(`${this.apiUrl}/${deptId}`, updatedDepartment).pipe(
      tap({
        next: (dept) => {
          console.log('Department updated successfully:', dept);
          const currentDepts = this.departmentsSubject.getValue();
          const index = currentDepts.findIndex(d => (d.id || d._id) === deptId);
          if (index !== -1) {
            currentDepts[index] = this.normalizeDepartment(dept);
            this.departmentsSubject.next([...currentDepts]);
          }
        },
        error: (error) => console.error('Error updating department:', error)
      })
    );
  }

  deleteDepartment(deptId: string): Observable<void> {
    console.log('Deleting department:', deptId);
    
    return this.http.delete<void>(`${this.apiUrl}/${deptId}`).pipe(
      tap({
        next: () => {
          console.log('Department deleted successfully');
          const currentDepts = this.departmentsSubject.getValue();
          this.departmentsSubject.next(currentDepts.filter(d => (d.id || d._id) !== deptId));
        },
        error: (error) => console.error('Error deleting department:', error)
      })
    );
  }

  // Force reload from backend
  refresh(): void {
    this.loadDepartments();
  }
}
