import { Component, ChangeDetectionStrategy, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { ClassService } from '../../services/class.service';
import { User } from '../../models/user';

@Component({
  selector: 'app-manage-results',
  imports: [CommonModule, FormsModule],
  templateUrl: './manage-results.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ManageResultsComponent implements OnInit {
  userService = inject(UserService);
  classService = inject(ClassService);
  cdr = inject(ChangeDetectorRef);

  students: User[] = [];
  filteredStudents: User[] = [];
  searchTerm = '';

  selectedStudent: User | null = null;
  studentResults: any[] = [];
  selectedSemesterResult: any | null = null;
  editableResult: any | null = null;

  isAddingResult = false;
  newResult: any | null = null;
  semesterExistsError = '';
  availableSemesters: number[] = [];

  ngOnInit() {
    this.students = this.userService.getStudents();
    this.filteredStudents = this.students;
  }

  filterStudents() {
    if (!this.searchTerm) {
      this.filteredStudents = this.students;
    } else {
      this.filteredStudents = this.students.filter(student =>
        `${student.firstName} ${student.lastName}`.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        student.id.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
    this.cdr.markForCheck();
  }

  selectStudent(student: User) {
    this.selectedStudent = student;
    this.studentResults = this.userService.getStudentResults(student.id);
    this.selectedSemesterResult = null;
    this.editableResult = null;
    this.isAddingResult = false;
    this.newResult = null;
    this.updateAvailableSemesters(student);
    this.cdr.markForCheck();
  }

  selectSemester(result: any) {
    this.selectedSemesterResult = result;
    this.editableResult = JSON.parse(JSON.stringify(result));
    this.isAddingResult = false;
    this.cdr.markForCheck();
  }
  
  clearStudentSelection() {
    this.selectedStudent = null;
    this.studentResults = [];
    this.selectedSemesterResult = null;
    this.editableResult = null;
    this.isAddingResult = false;
    this.newResult = null;
    this.availableSemesters = [];
    this.cdr.markForCheck();
  }
  
  cancelEdit() {
    this.selectedSemesterResult = null;
    this.editableResult = null;
    this.cdr.markForCheck();
  }
  
  openAddResultForm() {
    this.isAddingResult = true;
    this.editableResult = null;
    this.selectedSemesterResult = null;
    this.semesterExistsError = '';
    this.newResult = {
      semester: null,
      prn: this.selectedStudent?.details.prn || '',
      seatNo: '',
      examMonthYear: '',
      finalRemarks: 'SUCCESSFUL',
      subjects: []
    };
    this.cdr.markForCheck();
  }
  
  cancelAddResult() {
    this.isAddingResult = false;
    this.newResult = null;
    this.cdr.markForCheck();
  }

  onNewSemesterInput() {
    this.semesterExistsError = '';
    if (!this.newResult?.semester || !this.selectedStudent) {
      this.newResult.subjects = [];
      return;
    }

    const semester = Number(this.newResult.semester);
    if (this.studentResults.some(r => r.semester === semester)) {
      this.semesterExistsError = `Result for Semester ${semester} already exists.`;
      this.newResult.subjects = [];
      return;
    }
    
    const classId = this.selectedStudent.details.classId;
    if (!classId) {
        this.semesterExistsError = "This student is not assigned to a class. Cannot fetch subjects.";
        this.newResult.subjects = [];
        return;
    }

    const classSubjects = this.classService.getSubjectsForClass(classId);
    this.newResult.subjects = classSubjects.map((subject: any, index: number) => ({
      srNo: index + 1,
      paperCode: subject.code,
      paper: subject.name,
      internal: null,
      internalMax: 20,
      external: null,
      externalMax: 80,
      total: 0,
      totalMax: 100,
      grade: '--'
    }));
    this.cdr.markForCheck();
  }
  
  saveNewResult() {
    if (this.selectedStudent && this.newResult) {
      // Fixed: Create complete result object with studentId
      const resultData = {
        ...this.newResult,
        studentId: this.selectedStudent.id
      };
      
      this.userService.addStudentResult(resultData);
      alert('New result added successfully!');
      
      // Refresh after delay
      setTimeout(() => {
        if (this.selectedStudent) {
          this.selectStudent(this.selectedStudent);
        }
      }, 300);
    }
  }

  saveResult() {
    if (this.selectedStudent && this.editableResult) {
      // Fixed: Call updateStudentResult with 2 parameters (resultId, result)
      const resultId = this.editableResult._id || this.editableResult.id;
      this.userService.updateStudentResult(resultId, this.editableResult);
      alert('Result updated successfully!');
      
      // Refresh after delay
      setTimeout(() => {
        if (this.selectedStudent) {
          this.selectStudent(this.selectedStudent);
        }
      }, 300);
    }
  }

  private updateAvailableSemesters(student: User) {
    const degree = student.details?.degree?.toLowerCase() || '';
    let totalSemesters = 6; // Default to 6 for BSc degrees
    if (degree.includes('msc')) {
        totalSemesters = 4;
    }
    this.availableSemesters = Array.from({ length: totalSemesters }, (_, i) => i + 1);
  }

  private calculateGrade(subject: any): string {
    if (subject.total === null || subject.totalMax === null || subject.totalMax === 0) {
      return '--';
    }
    const percentage = (subject.total / subject.totalMax) * 100;
    if (percentage >= 90) return 'O';
    if (percentage >= 80) return 'A+';
    if (percentage >= 70) return 'A';
    if (percentage >= 60) return 'B+';
    if (percentage >= 50) return 'B';
    if (percentage >= 40) return 'C';
    return 'F';
  }

  recalculateTotal(subject: any) {
    const internalMarks = subject.internalMax > 0 ? (Number(subject.internal) || 0) : 0;
    const externalMarks = Number(subject.external) || 0;

    subject.total = internalMarks + externalMarks;
    subject.grade = this.calculateGrade(subject);
    this.cdr.markForCheck();
  }

  parsedData: any = null;

  handleFileUpload(event: any) {
    this.parsedData = null;
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const content = e.target.result;
        if (file.name.endsWith('.csv')) {
          this.parseCsv(content);
        } else if (file.name.endsWith('.json')) {
          this.parseJson(content);
        }
      };
      reader.readAsText(file);
    }
  }

  parseCsv(content: string) {
    const lines = content.split('\n').slice(1);
    this.parsedData = lines.map(line => {
      const [studentId, semester, subject, marks] = line.split(',');
      return { studentId, semester: Number(semester), subject, marks: Number(marks) };
    });
    alert('CSV file parsed. Ready to process.');
  }

  parseJson(content: string) {
    this.parsedData = JSON.parse(content);
    alert('JSON file parsed. Ready to process.');
  }

  downloadSampleCsv() {
    const csvContent = 'studentId,semester,subject,marks\nS00001,1,Advanced Java,85\nS00002,1,Advanced Java,90';
    this.downloadFile(csvContent, 'sample.csv', 'text/csv');
  }

  downloadSampleJson() {
    const jsonContent = JSON.stringify([
      { "studentId": "S00001", "semester": 1, "subject": "Advanced Java", "marks": 85 },
      { "studentId": "S00002", "semester": 1, "subject": "Advanced Java", "marks": 90 }
    ], null, 2);
    this.downloadFile(jsonContent, 'sample.json', 'application/json');
  }

  processFile() {
    if (this.parsedData) {
      console.log('Processing data:', this.parsedData);
      alert('File processed successfully! (See console for data)');
      this.parsedData = null;
    }
  }

  private downloadFile(content: string, fileName: string, contentType: string) {
    const a = document.createElement('a');
    const file = new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
  }
}
