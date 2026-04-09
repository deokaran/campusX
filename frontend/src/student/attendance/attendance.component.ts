
import { Component, ChangeDetectionStrategy, ChangeDetectorRef, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { AttendanceService } from '../../services/attendance.service';
import { ClassService } from '../../services/class.service';
import { User } from '../../models/user';
import { Subscription } from 'rxjs';

interface SubjectAttendance {
  subjectCode: string;
  subjectName: string;
  lecturesHeld: number;
  lecturesAttended: number;
  percentage: number;
}

@Component({
  selector: 'app-student-attendance',
  imports: [CommonModule],
  templateUrl: './attendance.component.html',
  styleUrls: ['./attendance.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AttendanceComponent implements OnInit, OnDestroy {
  authService = inject(AuthService);
  attendanceService = inject(AttendanceService);
  classService = inject(ClassService);
  cdr = inject(ChangeDetectorRef);

  student: User | null = null;
  attendanceSummary: SubjectAttendance[] = [];
  overall = {
    held: 0,
    attended: 0,
    percentage: 0
  };
  private subscriptions = new Subscription();
  private attendanceSub?: Subscription;

  ngOnInit(): void {
    this.subscriptions.add(this.authService.currentUser$.subscribe(student => {
      this.student = student;
      if (this.student?.details?.classId) {
        this.loadAttendanceData(this.student.id, this.student.details.classId);
      } else {
        this.attendanceSummary = [];
        this.overall = { held: 0, attended: 0, percentage: 0 };
        this.cdr.markForCheck();
      }
    }));

    this.subscriptions.add(this.classService.getClassesObservable().subscribe(() => {
      if (this.student?.details?.classId) {
        this.loadAttendanceData(this.student.id, this.student.details.classId);
      }
    }));
  }

  ngOnDestroy(): void {
    this.attendanceSub?.unsubscribe();
    this.subscriptions.unsubscribe();
  }

  loadAttendanceData(studentId: string, classId: string) {
    const subjects = this.classService.getSubjectsForClass(classId);
    this.attendanceSub?.unsubscribe();
    this.attendanceSub = this.attendanceService.getRecordsByClass(classId).subscribe(records => {
      let totalHeld = 0;
      let totalAttended = 0;

      this.attendanceSummary = subjects.map(subject => {
        const relevantRecords = records.filter(r => r.subjectCode === subject.code);
        const lecturesHeld = relevantRecords.length;
        const lecturesAttended = relevantRecords.filter(r => r.presentStudentIds.includes(studentId)).length;
        
        totalHeld += lecturesHeld;
        totalAttended += lecturesAttended;
        
        return {
          subjectCode: subject.code,
          subjectName: subject.name,
          lecturesHeld,
          lecturesAttended,
          percentage: lecturesHeld > 0 ? Math.round((lecturesAttended / lecturesHeld) * 100) : 0
        };
      });

      this.overall = {
        held: totalHeld,
        attended: totalAttended,
        percentage: totalHeld > 0 ? Math.round((totalAttended / totalHeld) * 100) : 0
      };
      this.cdr.markForCheck();
    });
  }
}
