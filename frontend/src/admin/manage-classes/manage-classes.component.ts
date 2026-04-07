
import { Component, ChangeDetectionStrategy, ChangeDetectorRef, inject, OnInit } from '@angular/core';
import { ClassService } from '../../services/class.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-manage-classes',
  imports: [CommonModule, RouterLink],
  templateUrl: './manage-classes.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ManageClassesComponent implements OnInit {
  classService = inject(ClassService);
  cdr = inject(ChangeDetectorRef);
  classes: any[] = [];
  private classesSub?: Subscription;
  
  ngOnInit() {
    this.classesSub = this.classService.getClassesObservable().subscribe(classes => {
      this.classes = classes;
      this.cdr.markForCheck();
    });
    this.classService.refresh();
  }

  ngOnDestroy() {
    this.classesSub?.unsubscribe();
  }

  getClassId(classData: any): string {
    return classData.id || classData._id || '';
  }

  deleteClass(classId: string) {
    if (confirm('Are you sure you want to delete this class?')) {
      this.classService.deleteClass(classId).subscribe({
        error: (err) => alert('Error deleting class: ' + (err.error?.message || err.message))
      });
    }
  }
}
