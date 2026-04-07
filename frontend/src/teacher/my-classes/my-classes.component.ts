import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { ClassService } from '../../services/class.service';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-my-classes',
  imports: [CommonModule, RouterLink],
  templateUrl: './my-classes.component.html',
  styleUrls: ['./my-classes.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyClassesComponent implements OnInit {
  myClasses: any[] = [];

  constructor(
    private classService: ClassService,
    private authService: AuthService
  ) {}
  
  ngOnInit(): void {
    const teacherId = this.authService.currentUserValue?.id;
    if (teacherId) {
      const allClasses = this.classService.getClasses();
      this.myClasses = allClasses.filter(c => c.teacherIds && c.teacherIds.includes(teacherId));
    }
  }
}
