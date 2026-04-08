import { Component, ChangeDetectionStrategy, inject, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ClassService } from '../../services/class.service';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { AttendanceService } from '../../services/attendance.service';
import { User } from '../../models/user';
import { AttendanceRecord } from '../../models/attendance';
import { Subscription } from 'rxjs';

interface EnrichedRecord extends AttendanceRecord {
  totalStudents: number;
  absentStudents: User[];
  className: string;
  subjectName: string;
}

@Component({
  selector: 'app-attendance',
  imports: [CommonModule, FormsModule],
  templateUrl: './attendance.component.html',
  styleUrls: ['./attendance.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AttendanceComponent implements OnInit, OnDestroy {
  classService = inject(ClassService);
  authService = inject(AuthService);
  userService = inject(UserService);
  attendanceService = inject(AttendanceService);
  cdr = inject(ChangeDetectorRef);
  
  view: 'take' | 'history' = 'take';
  
  // For taking/editing attendance
  step: 'details' | 'marking' = 'details';
  myClasses: any[] = [];
  subjects: any[] = [];
  students: User[] = [];
  today = formatDate(new Date(), 'yyyy-MM-dd', 'en-US');
  lectureDetails = {
    classId: '',
    subjectCode: '',
    date: this.today,
  };
  presentStudentIds = new Set<string>();
  editingRecordId: string | null = null;
  
  // For history view
  allRecords: EnrichedRecord[] = [];
  filteredRecords: EnrichedRecord[] = [];
  historySubjects: any[] = [];
  selectedClassId = 'all';
  selectedSubjectCode = 'all';
  private classesSub?: Subscription;
  
  ngOnInit() {
    const teacherId = this.authService.currentUserValue?.id || '';
    this.classesSub = this.classService.getClassesObservable().subscribe(classes => {
      this.myClasses = classes.filter(c => this.classService.isTeacherAssignedToClass(c, teacherId));

      if (!this.myClasses.length) {
        this.lectureDetails.classId = '';
        this.lectureDetails.subjectCode = '';
        this.subjects = [];
        this.cdr.markForCheck();
        return;
      }

      const stillSelected = this.myClasses.some(c => c.id === this.lectureDetails.classId);
      this.lectureDetails.classId = stillSelected ? this.lectureDetails.classId : (this.myClasses[0].id || '');
      this.onClassChange();
    });
    this.loadHistory();
  }

  ngOnDestroy(): void {
    this.classesSub?.unsubscribe();
  }

  onClassChange() {
    this.subjects = this.classService.getSubjectsForClass(this.lectureDetails.classId);
    if (this.subjects.length > 0) {
      this.lectureDetails.subjectCode = this.subjects[0].code;
    } else {
      this.lectureDetails.subjectCode = '';
    }
    this.cdr.markForCheck();
  }
  
  startAttendance() {
    if (this.lectureDetails.classId && this.lectureDetails.subjectCode) {
      // Fixed: getStudentsByClass returns Observable, need to subscribe
      this.classService.getStudentsByClass(this.lectureDetails.classId).subscribe(students => {
        this.students = students.sort((a, b) => (a.details.rollNo || 0) - (b.details.rollNo || 0));
        this.presentStudentIds.clear();
        this.step = 'marking';
        this.cdr.markForCheck();
      });
    }
  }
  
  togglePresence(studentId: string) {
    if (this.presentStudentIds.has(studentId)) {
      this.presentStudentIds.delete(studentId);
    } else {
      this.presentStudentIds.add(studentId);
    }
    this.cdr.markForCheck();
  }

  markAllPresent() {
    this.students.forEach(student => this.presentStudentIds.add(student.id));
    this.cdr.markForCheck();
  }

  markAllAbsent() {
    this.presentStudentIds.clear();
    this.cdr.markForCheck();
  }

  saveOrUpdateAttendance() {
    const teacherId = this.authService.currentUserValue?.id;
    if (!teacherId) {
      alert('Error: Could not identify the current teacher.');
      return;
    }
    
    if (this.editingRecordId) {
        const existingRecord = this.allRecords.find(r => r.id === this.editingRecordId);
        if (!existingRecord) {
            alert('Error: Could not find the record to update.');
            return;
        }
        // Fixed: updateAttendance expects the record with id inside
        const updatedRecord: AttendanceRecord = {
            ...existingRecord,
            classId: this.lectureDetails.classId,
            subjectCode: this.lectureDetails.subjectCode,
            date: this.lectureDetails.date,
            presentStudentIds: Array.from(this.presentStudentIds),
        };
        this.attendanceService.updateAttendance(updatedRecord).subscribe({
          next: () => {
            alert(`Attendance updated for ${this.presentStudentIds.size} out of ${this.students.length} students.`);
            this.step = 'details';
            this.editingRecordId = null;
            this.loadHistory();
            this.cdr.markForCheck();
          },
          error: (error) => {
            console.error('Error updating attendance:', error);
            alert('Error updating attendance: ' + (error.error?.message || error.message));
          }
        });
    } else {
        this.attendanceService.saveAttendance({
            classId: this.lectureDetails.classId,
            subjectCode: this.lectureDetails.subjectCode,
            date: this.lectureDetails.date,
            presentStudentIds: Array.from(this.presentStudentIds),
            teacherId: teacherId
        }).subscribe({
          next: () => {
            alert(`Attendance saved for ${this.presentStudentIds.size} out of ${this.students.length} students.`);
            this.step = 'details';
            this.editingRecordId = null;
            this.loadHistory();
            this.cdr.markForCheck();
          },
          error: (error) => {
            console.error('Error saving attendance:', error);
            alert('Error saving attendance: ' + (error.error?.message || error.message));
          }
        });
    }
  }

  backToDetails() {
    this.step = 'details';
    this.editingRecordId = null;
    this.cdr.markForCheck();
  }
  
  getClassName(classId: string): string {
    return this.myClasses.find(c => c.id === classId)?.name || 'N/A';
  }

  getSubjectName(subjectCode: string): string {
    return this.subjects.find(s => s.code === subjectCode)?.name || 'N/A';
  }
  
  loadHistory() {
     const teacherId = this.authService.currentUserValue?.id || '';
     this.attendanceService.getRecordsByTeacher(teacherId).subscribe(records => {
      this.allRecords = records.map(record => this.enrichRecord(record));
      this.applyFilters();
      this.cdr.markForCheck();
    });
  }
  
  isEditable(record: EnrichedRecord): boolean {
    const twelveHours = 12 * 60 * 60 * 1000;
    const recordTime = new Date(record.createdAt).getTime();
    const currentTime = new Date().getTime();
    return (currentTime - recordTime) < twelveHours;
  }

  editAttendance(record: EnrichedRecord) {
    this.editingRecordId = record.id;
    this.lectureDetails = {
      classId: record.classId,
      subjectCode: record.subjectCode,
      date: record.date
    };
    this.onClassChange(); 
    
    // Fixed: getStudentsByClass returns Observable
    this.classService.getStudentsByClass(record.classId).subscribe(students => {
      this.students = students.sort((a, b) => (a.details.rollNo || 0) - (b.details.rollNo || 0));
      this.presentStudentIds = new Set(record.presentStudentIds);
      this.view = 'take';
      this.step = 'marking';
      this.cdr.markForCheck();
    });
  }

  onHistoryClassChange() {
    if (this.selectedClassId !== 'all') {
      this.historySubjects = this.classService.getSubjectsForClass(this.selectedClassId);
    } else {
      this.historySubjects = [];
    }
    this.selectedSubjectCode = 'all';
    this.applyFilters();
  }

  applyFilters() {
    this.filteredRecords = this.allRecords.filter(record => {
      const classMatch = this.selectedClassId === 'all' || record.classId === this.selectedClassId;
      const subjectMatch = this.selectedSubjectCode === 'all' || record.subjectCode === this.selectedSubjectCode;
      return classMatch && subjectMatch;
    });
    this.cdr.markForCheck();
  }

  private enrichRecord(record: AttendanceRecord): EnrichedRecord {
    // Fixed: getStudentsByClass returns Observable, but we need synchronous
    // For now, get all students and filter by class
    const allStudents = this.userService.getStudents();
    const classInfo = this.classService.getClassById(record.classId);
    const allStudentsInClass = allStudents.filter(s => s.details.classId === record.classId);
    
    const presentIds = new Set(record.presentStudentIds);
    const absentStudents = allStudentsInClass.filter(student => !presentIds.has(student.id));
    const subjectInfo = classInfo?.subjects.find((s: any) => s.code === record.subjectCode);

    return {
      ...record,
      totalStudents: allStudentsInClass.length,
      absentStudents: absentStudents,
      className: classInfo?.name || 'N/A',
      subjectName: subjectInfo?.name || 'N/A'
    };
  }
}
