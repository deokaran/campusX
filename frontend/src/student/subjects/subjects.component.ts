
import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { ClassService } from '../../services/class.service';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-subjects',
  imports: [CommonModule],
  templateUrl: './subjects.component.html',
  styleUrls: ['./subjects.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SubjectsComponent implements OnInit {
  classService = inject(ClassService);
  userService = inject(UserService);
  authService = inject(AuthService);
  subjects: any[] = [];

  ngOnInit() {
    const student = this.authService.currentUserValue;
    if (student && student.details.classId) {
      this.subjects = this.classService.getSubjectsForClass(student.details.classId);
    }
  }

  getTeacherName(teacherId: string): string {
    const teacher = this.userService.getUserById(teacherId);
    return teacher ? `${teacher.firstName} ${teacher.lastName}` : 'N/A';
  }
}