import { Component, ChangeDetectionStrategy, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { User } from '../../models/user';
import { Observable, Subscription } from 'rxjs';
import { UserService } from '../../services/user.service';
import { ClassService } from '../../services/class.service';
import { DepartmentService } from '../../services/department.service';
import { NoticeService } from '../../services/notice.service';
import { Notice } from '../../models/notice';
import { RouterLink } from '@angular/router';

interface DepartmentStat {
  name: string;
  count: number;
  percentage: number;
  color: string;
}

@Component({
  selector: 'app-admin-overview',
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-overview.component.html',
  styleUrls: ['./admin-overview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminOverviewComponent implements OnInit, OnDestroy {
  admin$: Observable<User | null>;
  notices$: Observable<Notice[]>;

  totalStudents = 0;
  totalTeachers = 0;
  totalClasses = 0;
  totalDepartments = 0;

  totalFeesPaid = 0;
  totalFeesDue = 0;
  totalFees = 0;
  feesPaidPercentage = 0;

  departmentStats: DepartmentStat[] = [];
  private subscriptions = new Subscription();

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private classService: ClassService,
    private departmentService: DepartmentService,
    private noticeService: NoticeService,
    private cdr: ChangeDetectorRef
  ) {
    this.admin$ = this.authService.currentUser$;
    this.notices$ = this.noticeService.notices$;
  }
  
  ngOnInit(): void {
    this.subscriptions.add(this.userService.getUsersObservable().subscribe(() => this.refreshOverview()));
    this.subscriptions.add(this.classService.getClassesObservable().subscribe(() => this.refreshOverview()));
    this.subscriptions.add(this.departmentService.getDepartmentsObservable().subscribe(() => this.refreshOverview()));
    this.refreshOverview();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private refreshOverview(): void {
    const students = this.userService.getStudents();
    const teachers = this.userService.getTeachers();
    const classes = this.classService.getClasses();
    const departments = this.departmentService.getDepartments();

    this.totalStudents = students.length;
    this.totalTeachers = teachers.length;
    this.totalClasses = classes.length;
    this.totalDepartments = departments.length;

    this.totalFeesPaid = 0;
    this.totalFeesDue = 0;

    students.forEach(student => {
      if (student.details?.fees) {
        this.totalFeesPaid += parseInt(student.details.fees.paid?.toString() || '0');
        this.totalFeesDue += parseInt(student.details.fees.due?.toString() || '0');
      }
    });
    
    this.totalFees = this.totalFeesPaid + this.totalFeesDue;
    this.feesPaidPercentage = this.totalFees > 0 ? Math.round((this.totalFeesPaid / this.totalFees) * 100) : 0;

    this.calculateDepartmentStats(students);
    this.cdr.markForCheck();
  }

  private calculateDepartmentStats(students: User[]): void {
    const departmentCounts: { [key: string]: number } = {};
    const departments = this.departmentService.getDepartments();
    const deptMap = new Map(
      departments.map(d => [String(d.id || d._id || '').trim(), d.name])
    );

    students.forEach(student => {
      const deptId = String(student.details?.departmentId || '').trim();
      const deptName = deptId ? deptMap.get(deptId) || 'Unknown' : 'N/A';
      departmentCounts[deptName] = (departmentCounts[deptName] || 0) + 1;
    });

    const totalStudents = students.length;
    const colors = ['primary', 'success', 'warning', 'info', 'danger'];

    this.departmentStats = Object.entries(departmentCounts)
      .map(([name, count], index) => ({
        name,
        count,
        percentage: totalStudents > 0 ? (count / totalStudents) * 100 : 0,
        color: colors[index % colors.length]
      }))
      .sort((a, b) => b.count - a.count);
  }
}
