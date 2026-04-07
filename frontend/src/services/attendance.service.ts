import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AttendanceRecord } from '../models/attendance';

@Injectable({ providedIn: 'root' })
export class AttendanceService {
  private apiUrl = 'http://localhost:5000/api/attendance';
  private attendanceRecordsSubject = new BehaviorSubject<AttendanceRecord[]>([]);
  public attendanceRecords$ = this.attendanceRecordsSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadAttendanceRecords();
  }

  private loadAttendanceRecords(): void {
    this.http.get<AttendanceRecord[]>(this.apiUrl).subscribe(
      records => this.attendanceRecordsSubject.next(records),
      error => console.error('Error loading attendance records:', error)
    );
  }

  saveAttendance(record: Omit<AttendanceRecord, 'id' | 'createdAt'>): void {
    this.http.post<AttendanceRecord>(this.apiUrl, record).subscribe({
      next: (newRecord) => {
        const currentRecords = this.attendanceRecordsSubject.getValue();
        this.attendanceRecordsSubject.next([...currentRecords, newRecord]);
      },
      error: (error) => console.error('Error saving attendance:', error)
    });
  }
  
  // BACKWARD COMPATIBLE - accepts just the record (uses record.id internally)
  updateAttendance(updatedRecord: AttendanceRecord): void {
    const recordId = updatedRecord.id;
    if (!recordId) {
      console.error('Cannot update attendance: no record ID');
      return;
    }
    
    this.http.put<AttendanceRecord>(`${this.apiUrl}/${recordId}`, updatedRecord).subscribe({
      next: (record) => {
        const currentRecords = this.attendanceRecordsSubject.getValue();
        const index = currentRecords.findIndex(r => r.id === recordId);
        if (index !== -1) {
          currentRecords[index] = record;
          this.attendanceRecordsSubject.next([...currentRecords]);
        }
      },
      error: (error) => console.error('Error updating attendance:', error)
    });
  }

  getRecordsByTeacher(teacherId: string): Observable<AttendanceRecord[]> {
    return this.attendanceRecords$.pipe(
      map(records => records
        .filter(r => r.teacherId === teacherId)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      )
    );
  }

  getRecordsByClass(classId: string): Observable<AttendanceRecord[]> {
    return this.attendanceRecords$.pipe(
      map(records => records
        .filter(r => r.classId === classId)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      )
    );
  }

  getRecordsByStudent(studentId: string): Observable<AttendanceRecord[]> {
    return this.attendanceRecords$.pipe(
      map(records => records.filter(r => r.presentStudentIds.includes(studentId)))
    );
  }

  deleteAttendance(recordId: string): void {
    this.http.delete<void>(`${this.apiUrl}/${recordId}`).subscribe({
      next: () => {
        const currentRecords = this.attendanceRecordsSubject.getValue();
        this.attendanceRecordsSubject.next(currentRecords.filter(r => r.id !== recordId));
      },
      error: (error) => console.error('Error deleting attendance:', error)
    });
  }
}
