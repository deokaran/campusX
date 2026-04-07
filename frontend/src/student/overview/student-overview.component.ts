import { Component, ChangeDetectionStrategy, OnInit, ChangeDetectorRef } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user';
import { Observable, BehaviorSubject } from 'rxjs';
import { CommonModule } from '@angular/common';
import { AttendanceService } from '../../services/attendance.service';
import { ClassService } from '../../services/class.service';
import { NoticeService } from '../../services/notice.service';
import { Notice } from '../../models/notice';
import { UserService } from '../../services/user.service';

interface ChartData {
  label: string;
  value: number;
  color: string;
}

@Component({
  selector: 'app-student-overview',
  imports: [CommonModule],
  templateUrl: './student-overview.component.html',
  styleUrls: ['./student-overview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentOverviewComponent implements OnInit {
  student$: Observable<User | null>;
  marksData: ChartData[] = [];

  private attendanceDataSubject = new BehaviorSubject<{ total: number; attended: number; percentage: number; }>({ total: 0, attended: 0, percentage: 0 });
  attendanceData$ = this.attendanceDataSubject.asObservable();
  
  notices$: Observable<Notice[]>;

  constructor(
    private authService: AuthService,
    private attendanceService: AttendanceService,
    private classService: ClassService,
    private noticeService: NoticeService,
    private userService: UserService,
    private cdr: ChangeDetectorRef
  ) {
    this.student$ = this.authService.currentUser$;
    this.notices$ = this.noticeService.notices$;
  }

  ngOnInit(): void {
    this.student$.subscribe(student => {
      if (student) {
        if (student.details.classId) {
          this.loadAttendanceData(student.id, student.details.classId);
        }
        this.loadMarksData(student.id);
      }
    });
  }

  private loadMarksData(studentId: string): void {
    const results = this.userService.getStudentResults(studentId);
    
    this.marksData = results.map((result, index) => {
      const totalMarksObtained = result.subjects.reduce((acc: number, subject: any) => acc + (subject.total || 0), 0);
      const totalMaximumMarks = result.subjects.reduce((acc: number, subject: any) => acc + (subject.totalMax || 0), 0);
      
      const percentage = totalMaximumMarks > 0 ? Math.round((totalMarksObtained / totalMaximumMarks) * 100) : 0;

      return {
        label: `S${result.semester}`,
        value: percentage,
        color: index % 2 === 0 ? 'bg-danger' : 'bg-info'
      };
    });
    
    this.cdr.markForCheck();
  }

  loadAttendanceData(studentId: string, classId: string) {
    this.attendanceService.getRecordsByClass(classId).subscribe(records => {
      const subjects = this.classService.getSubjectsForClass(classId);
      let totalHeld = 0;
      let totalAttended = 0;

      subjects.forEach(subject => {
        const relevantRecords = records.filter(r => r.subjectCode === subject.code);
        totalHeld += relevantRecords.length;
        totalAttended += relevantRecords.filter(r => r.presentStudentIds.includes(studentId)).length;
      });

      const percentage = totalHeld > 0 ? Math.round((totalAttended / totalHeld) * 100) : 0;
      
      this.attendanceDataSubject.next({
        total: totalHeld,
        attended: totalAttended,
        percentage
      });
    });
  }
}
