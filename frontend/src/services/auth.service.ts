import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { User, UserRole } from '../models/user';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:5000/api/auth';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();

  constructor(
    private router: Router,
    private http: HttpClient
  ) {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  // SIMPLIFIED LOGIN (No JWT)
  login(id: string, password: string): Observable<boolean> {
    console.log('Login request:', { id, password: password ? '***' : 'missing' });
    
    return this.http.post<{ user: User; message: string }>(`${this.apiUrl}/login`, { id, password }).pipe(
      map(response => {
        console.log('Login response:', response);
        
        if (response.user) {
          this.updateCurrentUser(response.user);
          this.navigateToDashboard(response.user.role);
          return true;
        }
        return false;
      }),
      catchError(error => {
        console.error('Login error:', error);
        return of(false);
      })
    );
  }

  updateCurrentUser(user: User) {
    const userToStore = { ...user };
    delete userToStore.password; // Do not store password
    this.currentUserSubject.next(userToStore);
    localStorage.setItem('currentUser', JSON.stringify(userToStore));
  }

  logout() {
    this.currentUserSubject.next(null);
    localStorage.removeItem('currentUser');
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!this.currentUserValue;
  }

  getUserRole(): UserRole | null {
    return this.currentUserValue?.role || null;
  }
  
  private navigateToDashboard(role: UserRole) {
    switch (role) {
      case 'S':
        this.router.navigate(['/student']);
        break;
      case 'T':
        this.router.navigate(['/teacher']);
        break;
      case 'A':
        this.router.navigate(['/admin']);
        break;
      default:
        this.router.navigate(['/login']);
        break;
    }
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot-password`, { email });
  }

  resetPassword(email: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, { email, password: newPassword });
  }
}
