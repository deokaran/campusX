import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit } from '@angular/core';
import { ClassService } from '../../services/class.service';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-my-classes',
  imports: [CommonModule, RouterLink],
  templateUrl: './my-classes.component.html',
  styleUrls: ['./my-classes.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyClassesComponent implements OnInit {
  myClasses: any[] = [];
  private classesSub?: Subscription;

  constructor(
    private classService: ClassService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}
  
  ngOnInit(): void {
    const teacherId = this.authService.currentUserValue?.id;
    if (teacherId) {
      this.classesSub = this.classService.getClassesObservable().subscribe(classes => {
        this.myClasses = classes.filter(c => this.classService.isTeacherAssignedToClass(c, teacherId));
        this.cdr.markForCheck();
      });
    }
  }

  ngOnDestroy(): void {
    this.classesSub?.unsubscribe();
  }
}
