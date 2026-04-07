
import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { ClassService } from '../../services/class.service';

@Component({
  selector: 'app-time-table',
  imports: [CommonModule],
  templateUrl: './time-table.component.html',
  styleUrls: ['./time-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimeTableComponent implements OnInit {
  authService = inject(AuthService);
  classService = inject(ClassService);
  
  schedule: any[] = [];
  subjects: any[] = [];
  days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  dayKeys = ['mon', 'tue', 'wed', 'thu', 'fri'];

  ngOnInit() {
    const student = this.authService.currentUserValue;
    if (student && student.details.classId) {
      const classData = this.classService.getClassById(student.details.classId);
      if (classData) {
        this.schedule = classData.timeTable || [];
        this.subjects = classData.subjects || [];
      }
    }
  }

  getSubjectName(code: string): string {
    if (!code) return '';
    if (code === 'BREAK') return 'BREAK';
    const subject = this.subjects.find(s => s.code === code);
    return subject ? subject.name : code;
  }
}