import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { User, MenuItem } from '../models/user';

export interface PortalEvent {
  date: string;
  name: string;
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:5000/api/users';
  private usersSubject = new BehaviorSubject<User[]>([]);
  public users$ = this.usersSubject.asObservable();

  private resultsCache: { [studentId: string]: any[] } = {};

  private studentMenu: MenuItem[] = [
    { path: 'overview', icon: 'fa-solid fa-tachometer-alt', label: 'Overview' },
    { path: 'subjects', icon: 'fa-solid fa-book', label: 'Subjects' },
    { path: 'attendance', icon: 'fa-solid fa-user-check', label: 'Attendance' },
    { path: 'tests', icon: 'fa-solid fa-file-alt', label: 'Tests' },
    { path: 'code-editor', icon: 'fa-solid fa-code', label: 'Code Editor' },
    { path: 'semester-results', icon: 'fa-solid fa-graduation-cap', label: 'Semester Results' },
    { path: 'fees', icon: 'fa-solid fa-file-invoice-dollar', label: 'My Fees' },
    { path: 'time-table', icon: 'fa-solid fa-calendar-alt', label: 'Time Table' },
    { path: 'chatroom', icon: 'fa-solid fa-comments', label: 'Chatroom' },
    { path: 'profile', icon: 'fa-solid fa-user', label: 'Profile' },
  ];

  private teacherMenu: MenuItem[] = [
    { path: 'overview', icon: 'fa-solid fa-tachometer-alt', label: 'Overview' },
    { path: 'my-classes', icon: 'fa-solid fa-chalkboard-user', label: 'My Classes' },
    { path: 'attendance', icon: 'fa-solid fa-user-check', label: 'Attendance' },
    { path: 'create-test', icon: 'fa-solid fa-file-pen', label: 'Create Test' },
    { path: 'manage-tests', icon: 'fa-solid fa-list-check', label: 'Manage Tests' },
    { path: 'notices', icon: 'fa-solid fa-bullhorn', label: 'Notices' },
    { path: 'profile', icon: 'fa-solid fa-user', label: 'Profile' },
  ];

  private adminMenu: MenuItem[] = [
    { path: 'overview', icon: 'fa-solid fa-tachometer-alt', label: 'Overview' },
    { path: 'manage-admins', icon: 'fa-solid fa-user-shield', label: 'Manage Admins' },
    { path: 'manage-teachers', icon: 'fa-solid fa-person-chalkboard', label: 'Manage Teachers' },
    { path: 'manage-students', icon: 'fa-solid fa-users-gear', label: 'Manage Students' },
    { path: 'manage-classes', icon: 'fa-solid fa-school', label: 'Manage Classes' },
    { path: 'manage-departments', icon: 'fa-solid fa-building', label: 'Manage Departments' },
    { path: 'manage-fees', icon: 'fa-solid fa-cash-register', label: 'Manage Fees' },
    { path: 'manage-results', icon: 'fa-solid fa-square-poll-vertical', label: 'Manage Results' },
    { path: 'manage-notices', icon: 'fa-solid fa-bullhorn', label: 'Manage Notices' },
    { path: 'profile', icon: 'fa-solid fa-user-tie', label: 'Profile' },
  ];

  constructor(private http: HttpClient) {
    this.loadUsers();
  }

  private loadUsers(): void {
    this.http.get<User[]>(this.apiUrl).subscribe({
      next: (users) => {
        console.log('Loaded users from backend:', users.length);
        this.usersSubject.next(users.map(u => this.normalizeUser(u)));
      },
      error: (error) => console.error('Error loading users:', error)
    });
  }

  private normalizeUser(u: any): User {
    // Ensure id is always set from _id
    const id = u.id || u._id || '';
    // If backend only stored 'name', split it into firstName/lastName
    let firstName = u.firstName || '';
    let middleName = u.middleName || '';
    let lastName = u.lastName || '';
    if (!firstName && !lastName && u.name) {
      const parts = u.name.trim().split(' ');
      firstName = parts[0] || '';
      lastName = parts.length > 1 ? parts[parts.length - 1] : '';
      middleName = parts.length > 2 ? parts.slice(1, -1).join(' ') : '';
    }
    return { ...u, id, _id: id, firstName, middleName, lastName };
  }

  // BACKWARD COMPATIBLE SYNCHRONOUS METHODS
  getUsers(): User[] {
    return this.usersSubject.getValue();
  }

  getUserById(id: string): User | undefined {
    return this.usersSubject.getValue().find(u => (u.id || u._id) === id);
  }

  fetchUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`).pipe(
      map(user => this.normalizeUser(user)),
      tap(user => {
        const currentUsers = this.usersSubject.getValue();
        const index = currentUsers.findIndex(u => (u.id || u._id) === id);

        if (index !== -1) {
          currentUsers[index] = user;
          this.usersSubject.next([...currentUsers]);
        } else {
          this.usersSubject.next([...currentUsers, user]);
        }
      })
    );
  }

  getTeachers(): User[] {
    return this.usersSubject.getValue().filter(u => u.role === 'T');
  }

  getStudents(): User[] {
    return this.usersSubject.getValue().filter(u => u.role === 'S');
  }

  getUsersByIds(ids: string[]): User[] {
    return this.usersSubject.getValue().filter(u => ids.includes(u.id || u._id || ''));
  }

  // ASYNC METHODS (OBSERVABLE-BASED FOR API CALLS)
  getUsersObservable(): Observable<User[]> {
    return this.users$;
  }

  addUser(user: User): void {
    console.log('Adding user to backend:', user);
    
    this.http.post<User>(this.apiUrl, user).subscribe({
      next: (newUser) => {
        console.log('User added successfully:', newUser);
        const currentUsers = this.usersSubject.getValue();
        this.usersSubject.next([...currentUsers, this.normalizeUser(newUser)]);
      },
      error: (error) => {
        console.error('Error adding user:', error);
        alert('Error adding user: ' + (error.error?.message || error.message));
      }
    });
  }

  updateUser(updatedUser: User): void {
    const userId = updatedUser.id || updatedUser._id;
    console.log('Updating user:', userId, updatedUser);
    
    this.http.put<User>(`${this.apiUrl}/${userId}`, updatedUser).subscribe({
      next: (user) => {
        console.log('User updated successfully:', user);
        const currentUsers = this.usersSubject.getValue();
        const index = currentUsers.findIndex(u => (u.id || u._id) === userId);
        if (index !== -1) {
          currentUsers[index] = this.normalizeUser(user);
          this.usersSubject.next([...currentUsers]);
        }
      },
      error: (error) => {
        console.error('Error updating user:', error);
        alert('Error updating user: ' + (error.error?.message || error.message));
      }
    });
  }
  
  deleteUser(userId: string): void {
    console.log('Deleting user:', userId);
    
    this.http.delete<void>(`${this.apiUrl}/${userId}`).subscribe({
      next: () => {
        console.log('User deleted successfully');
        const currentUsers = this.usersSubject.getValue();
        this.usersSubject.next(currentUsers.filter(u => (u.id || u._id) !== userId));
      },
      error: (error) => {
        console.error('Error deleting user:', error);
        alert('Error deleting user: ' + (error.error?.message || error.message));
      }
    });
  }

  updatePassword(userId: string, newPassword: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${userId}/password`, { password: newPassword });
  }

  getMenuForRole(role: string): MenuItem[] {
    switch (role) {
      case 'S': return this.studentMenu;
      case 'T': return this.teacherMenu;
      case 'A': return this.adminMenu;
      default: return [];
    }
  }

  getStudentMenuForUser(user: User | null): MenuItem[] {
    const hasClass = !!user?.details?.classId;

    return this.studentMenu.map(item => ({
      ...item,
      disabled: item.path === 'chatroom' ? !hasClass : false
    }));
  }

  // STUDENT RESULTS - BACKWARD COMPATIBLE
  getStudentResults(studentId: string): any[] {
    if (this.resultsCache[studentId]) {
      return this.resultsCache[studentId];
    }
    
    this.http.get<any[]>(`http://localhost:5000/api/results/student/${studentId}`).subscribe({
      next: (results) => {
        this.resultsCache[studentId] = results;
      },
      error: (error) => console.error('Error loading results:', error)
    });
    
    return [];
  }

  getStudentResultsObservable(studentId: string): Observable<any[]> {
    return this.http.get<any[]>(`http://localhost:5000/api/results/student/${studentId}`).pipe(
      tap(results => this.resultsCache[studentId] = results)
    );
  }

  addStudentResult(result: any): Observable<any> {
    return this.http.post('http://localhost:5000/api/results', result).pipe(
      tap(() => {
        if (result.studentId) {
          delete this.resultsCache[result.studentId];
        }
      })
    );
  }

  updateStudentResult(resultId: string, updatedResult: any): Observable<any> {
    return this.http.put(`http://localhost:5000/api/results/${resultId}`, updatedResult).pipe(
      tap(() => {
        if (updatedResult.studentId) {
          delete this.resultsCache[updatedResult.studentId];
        }
      })
    );
  }

  reassignStudent(studentId: string, oldClassId: string, newClassId: string): void {
    const student = this.getUserById(studentId);
    if (student && student.details?.classId === oldClassId) {
      student.details.classId = newClassId;
      this.updateUser(student);
    }
  }

  // Force reload from backend
  refresh(): void {
    this.loadUsers();
  }
}
