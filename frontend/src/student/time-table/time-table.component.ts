
import { Component, ChangeDetectionStrategy, ChangeDetectorRef, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { ClassService } from '../../services/class.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-time-table',
  imports: [CommonModule],
  templateUrl: './time-table.component.html',
  styleUrls: ['./time-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimeTableComponent implements OnInit, OnDestroy {
  authService = inject(AuthService);
  classService = inject(ClassService);
  cdr = inject(ChangeDetectorRef);
  
  schedule: any[] = [];
  subjects: any[] = [];
  days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  dayKeys = ['mon', 'tue', 'wed', 'thu', 'fri'];
  private currentClassId = '';
  private subscriptions = new Subscription();

  ngOnInit() {
    this.subscriptions.add(this.authService.currentUser$.subscribe(student => {
      this.currentClassId = student?.details?.classId || '';
      this.loadTimeTable();
    }));
    this.subscriptions.add(this.classService.getClassesObservable().subscribe(() => {
      this.loadTimeTable();
    }));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private loadTimeTable() {
    const classData = this.currentClassId
      ? this.classService.getClassById(this.currentClassId)
      : undefined;

    this.schedule = classData?.timeTable || [];
    this.subjects = classData?.subjects || [];
    this.cdr.markForCheck();
  }

  getSubjectName(code: string): string {
    if (!code) return '';
    if (code === 'BREAK') return 'BREAK';
    const subject = this.subjects.find(s => s.code === code);
    return subject ? subject.name : code;
  }
}
