
import { Component, ChangeDetectionStrategy, inject, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ClassService } from '../../services/class.service';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { User } from '../../models/user';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-class-detail',
  imports: [CommonModule, RouterLink],
  templateUrl: './class-detail.component.html',
  styleUrls: ['./class-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClassDetailComponent implements OnInit, OnDestroy {
  // FIX: Explicitly type injected ActivatedRoute.
  route: ActivatedRoute = inject(ActivatedRoute);
  classService = inject(ClassService);
  userService = inject(UserService);

  classData: any = null;
  students: User[] = [];
  
  days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  dayKeys = ['mon', 'tue', 'wed', 'thu', 'fri'];

  private routeSub!: Subscription;

  ngOnInit(): void {
    this.routeSub = this.route.params.subscribe(params => {
      const id = params['classId'];
      if (id) {
        this.classData = this.classService.getClassById(id);
        if (this.classData) {
          this.students = this.userService.getUsersByIds(this.classData.studentIds)
            .sort((a, b) => (a.details.rollNo || 0) - (b.details.rollNo || 0));
        }
      }
    });
  }

  ngOnDestroy(): void {
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
  }

  getTeacherName(teacherId: string): string {
    const teacher = this.userService.getUserById(teacherId);
    return teacher ? `${teacher.firstName} ${teacher.lastName}` : 'N/A';
  }

  getFeeStatus(student: User): 'Paid' | 'Pending' {
    if (student.details?.fees?.due > 0) {
      return 'Pending';
    }
    return 'Paid';
  }

  getSubjectName(code: string): string {
    if (!code) return '';
    if (code === 'BREAK') return 'BREAK';
    if (!this.classData || !this.classData.subjects) return code;
    
    // Explicitly type subject as any to avoid implicit any error if necessary, 
    // or rely on the structure.
    const subject = this.classData.subjects.find((s: any) => s.code === code);
    return subject ? subject.name : code;
  }
}
