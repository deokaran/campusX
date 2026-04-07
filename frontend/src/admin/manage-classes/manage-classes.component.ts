
import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { ClassService } from '../../services/class.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-manage-classes',
  imports: [CommonModule, RouterLink],
  templateUrl: './manage-classes.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ManageClassesComponent implements OnInit {
  classService = inject(ClassService);
  classes: any[] = [];
  
  ngOnInit() {
    this.classes = this.classService.getClasses();
  }
}