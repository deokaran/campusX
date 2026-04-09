import { Component, ChangeDetectionStrategy, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { User } from '../../models/user';
import { Observable, Subscription } from 'rxjs';
import { ClassService } from '../../services/class.service';
import { TestService } from '../../services/test.service';
import { UserService } from '../../services/user.service';
import { map } from 'rxjs/operators';
import { RouterLink } from '@angular/router';
import { NoticeService } from '../../services/notice.service';
import { Notice } from '../../models/notice';

@Component({
  selector: 'app-teacher-overview',
  imports: [CommonModule, RouterLink],
  templateUrl: './teacher-overview.component.html',
  styleUrls: ['./teacher-overview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeacherOverviewComponent implements OnInit, OnDestroy {
  teacher$: Observable<User | null>;
  
  classCount = 0;
  studentCount = 0;
  activeTestsCount$!: Observable<number>;
  notices$!: Observable<Notice[]>;
  private classesSub?: Subscription;

  constructor(
    private authService: AuthService,
    private classService: ClassService,
    private testService: TestService,
    private userService: UserService,
    private noticeService: NoticeService,
    private cdr: ChangeDetectorRef
  ) {
    this.teacher$ = this.authService.currentUser$;
    this.notices$ = this.noticeService.notices$.pipe(
      map(notices => notices.slice(0, 5))
    );
  }

  ngOnInit(): void {
    const teacherId = this.authService.currentUserValue?.id;
    if (teacherId) {
      this.classesSub = this.classService.getClassesObservable().subscribe(classes => {
        const myClasses = classes.filter(c => this.classService.isTeacherAssignedToClass(c, teacherId));
        this.classCount = myClasses.length;
        this.studentCount = myClasses.reduce((acc, curr) => acc + curr.studentIds.length, 0);
        this.cdr.markForCheck();
      });

      this.activeTestsCount$ = this.testService.getTeacherTests(teacherId).pipe(
        map(tests => tests.filter(t => t.status === 'Published').length)
      );
    }
  }

  ngOnDestroy(): void {
    this.classesSub?.unsubscribe();
  }
}
