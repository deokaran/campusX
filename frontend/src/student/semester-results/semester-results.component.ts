
import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { User } from '../../models/user';

declare var html2canvas: any;
declare var jspdf: any;

@Component({
  selector: 'app-semester-results',
  imports: [CommonModule, FormsModule],
  templateUrl: './semester-results.component.html',
  styleUrls: ['./semester-results.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SemesterResultsComponent implements OnInit {
  userService = inject(UserService);
  authService = inject(AuthService);
  
  student: User | null = null;
  allResults: any[] = [];
  semesters: number[] = [];
  selectedSemester: number | null = null;
  selectedResult: any = null;

  totalInternal = 0;
  totalExternal = 0;
  grandTotal = 0;

  ngOnInit() {
    this.student = this.authService.currentUserValue;
    if (this.student) {
      this.allResults = this.userService.getStudentResults(this.student.id);
      this.semesters = this.allResults.map(r => r.semester).sort((a, b) => a - b);
    }
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
        pdf.save(`Semester-${this.selectedSemester}-Result.pdf`);
      });
    }
  }
}