
import { Component, ChangeDetectionStrategy, inject, OnInit, OnDestroy, AfterViewInit, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TestService, Test, TestSubmission } from '../../services/test.service';
import { ClassService } from '../../services/class.service';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { Subscription, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as d3 from 'd3';

interface PerformanceData {
  rollNo: number;
  score: number;
  studentName: string;
}

@Component({
  selector: 'app-class-performance',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './class-performance.component.html',
  styleUrls: ['./class-performance.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClassPerformanceComponent implements OnInit, OnDestroy, AfterViewInit {
  route: ActivatedRoute = inject(ActivatedRoute);
  classService = inject(ClassService);
  testService = inject(TestService);
  authService = inject(AuthService);
  userService = inject(UserService);
  cdr = inject(ChangeDetectorRef);

  @ViewChild('chartContainer') private chartContainer!: ElementRef;
  
  classId!: string;
  className = '';
  classTests$!: Observable<Test[]>;
  selectedTestId: string | null = null;
  performanceData: PerformanceData[] = [];
  
  private routeSub!: Subscription;
  private classesSub?: Subscription;
  private performanceSub?: Subscription;

  ngOnInit(): void {
    this.routeSub = this.route.params.subscribe(params => {
      this.classId = params['classId'];
      const teacherId = this.authService.currentUserValue?.id || '';
      if (this.classId && teacherId) {
        this.classTests$ = this.testService.getTeacherTests(teacherId).pipe(
          map(tests => tests.filter(t => t.classId === this.classId && String(t.status || '').toLowerCase() !== 'draft'))
        );
      }
      this.classesSub?.unsubscribe();
      this.classesSub = this.classService.getClassesObservable().subscribe(() => {
        this.className = this.classService.getClassById(this.classId)?.name || '';
        this.cdr.markForCheck();
      });
      if (this.classId) {
        this.className = this.classService.getClassById(this.classId)?.name || '';
      }
    });
  }

  ngAfterViewInit() {
    this.createChart();
  }

  ngOnDestroy(): void {
    if (this.routeSub) this.routeSub.unsubscribe();
    this.classesSub?.unsubscribe();
    this.performanceSub?.unsubscribe();
  }

  onTestSelect(event: Event): void {
    const testId = (event.target as HTMLSelectElement).value;
    this.selectedTestId = testId;
    if (!testId) {
      this.performanceData = [];
      this.createChart();
      return;
    }
    
    this.performanceSub?.unsubscribe();
    this.performanceSub = this.testService.getSubmissionsForTestObservable(testId).subscribe(submissions => {
      this.classService.getStudentsByClass(this.classId).subscribe(students => {
        this.performanceData = students
          .map(student => {
            const submission = submissions.find(s => s.studentId === student.id);
            return {
              rollNo: student.details.rollNo,
              score: submission ? submission.score : 0,
              studentName: `${student.firstName} ${student.lastName}`
            };
          })
          .sort((a, b) => a.rollNo - b.rollNo);
          
        this.createChart();
        this.cdr.markForCheck();
      });
    });
  }
  
  private createChart(): void {
    const element = this.chartContainer.nativeElement;
    d3.select(element).select('svg').remove();

    if (this.performanceData.length === 0) {
      return;
    }

    const margin = { top: 20, right: 30, bottom: 40, left: 40 };
    const width = element.clientWidth - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3.select(element)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scalePoint()
      .domain(this.performanceData.map(d => d.rollNo.toString()))
      .range([0, width]);
      
    const y = d3.scaleLinear()
      .domain([0, d3.max(this.performanceData, d => d.score) as number])
      .range([height, 0]);

    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .style('text-anchor', 'end');
    
    svg.append('text')
      .attr('text-anchor', 'end')
      .attr('x', width / 2 + margin.left)
      .attr('y', height + margin.top + 15)
      .text('Roll Number');

    svg.append('g').call(d3.axisLeft(y));
    
    svg.append('text')
        .attr('text-anchor', 'end')
        .attr('transform', 'rotate(-90)')
        .attr('y', -margin.left + 15)
        .attr('x', -height / 2)
        .text('Marks Obtained');

    svg.append('path')
      .datum(this.performanceData)
      .attr('fill', 'none')
      .attr('stroke', 'var(--bs-warning)')
      .attr('stroke-width', 2.5)
      .attr('d', d3.line<PerformanceData>()
        .x(d => x(d.rollNo.toString()) as number)
        .y(d => y(d.score))
      );

    svg.selectAll('dot')
      .data(this.performanceData)
      .enter()
      .append('circle')
      .attr('cx', d => x(d.rollNo.toString()) as number)
      .attr('cy', d => y(d.score))
      .attr('r', 5)
      .attr('fill', 'var(--bs-warning-emphasis)')
      .append('title')
      .text(d => `Roll No: ${d.rollNo}\nName: ${d.studentName}\nScore: ${d.score}`);
  }
}
