import { Component, ChangeDetectionStrategy, ChangeDetectorRef, inject, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UserService } from '../../services/user.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { User } from '../../models/user';
import { Subscription } from 'rxjs';

declare var html2canvas: any;
declare var jspdf: any;

@Component({
  selector: 'app-teacher-student-results',
  imports: [CommonModule, FormsModule],
  templateUrl: './student-results.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentResultsComponent implements OnInit, OnDestroy {
  route: ActivatedRoute = inject(ActivatedRoute);
  router: Router = inject(Router);
  userService = inject(UserService);
  cdr = inject(ChangeDetectorRef);

  student: User | null = null;
  allResults: any[] = [];
  semesters: number[] = [];
  selectedSemester: number | null = null;
  selectedResult: any = null;
  
  totalInternal = 0;
  totalExternal = 0;
  grandTotal = 0;

  private routeSub!: Subscription;
  private resultsSub?: Subscription;

  ngOnInit() {
    this.routeSub = this.route.params.subscribe(params => {
      const studentId = params['studentId'];
      if (studentId) {
        this.userService.fetchUserById(studentId).subscribe(student => {
          this.student = student;
          this.resultsSub?.unsubscribe();
          this.resultsSub = this.userService.getStudentResultsObservable(student.id).subscribe(results => {
            this.allResults = results;
            this.semesters = this.allResults.map(r => r.semester).sort((a, b) => a - b);
            if (this.selectedSemester !== null) {
              this.selectSemester(this.selectedSemester);
            }
            this.cdr.markForCheck();
          });
        });
      }
    });
  }
  
  ngOnDestroy(): void {
    this.routeSub.unsubscribe();
    this.resultsSub?.unsubscribe();
  }

  selectSemester(semester: number) {
    this.selectedSemester = semester;
    this.selectedResult = this.allResults.find(r => r.semester === this.selectedSemester) || null;
    this.calculateTotals();
  }

  clearSelection() {
    this.selectedSemester = null;
    this.selectedResult = null;
    this.totalInternal = 0;
    this.totalExternal = 0;
    this.grandTotal = 0;
  }

  private calculateTotals() {
    if (this.selectedResult && this.selectedResult.subjects) {
      this.totalInternal = this.selectedResult.subjects.reduce((acc: number, subject: any) => acc + (subject.internal || 0), 0);
      this.totalExternal = this.selectedResult.subjects.reduce((acc: number, subject: any) => acc + (subject.external || 0), 0);
      this.grandTotal = this.selectedResult.subjects.reduce((acc: number, subject: any) => acc + (subject.total || 0), 0);
    } else {
      this.totalInternal = 0;
      this.totalExternal = 0;
      this.grandTotal = 0;
    }
  }

  downloadPdf() {
    const resultElement = document.getElementById('resultCard');
    if (resultElement) {
      html2canvas(resultElement, { scale: 2 }).then((canvas: any) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jspdf.jsPDF({
          orientation: 'portrait',
          unit: 'pt',
          format: 'a4'
        });
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`${this.student?.id}-Semester-${this.selectedSemester}-Result.pdf`);
      });
    }
  }
}
