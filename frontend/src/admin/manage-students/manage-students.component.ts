import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ClassService } from '../../services/class.service';
import { DepartmentService } from '../../services/department.service';
import { Department } from '../../models/department';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-manage-students',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './manage-students.component.html',
})
export class ManageStudentsComponent implements OnInit, OnDestroy {
  students: User[] = [];
  filteredStudents: User[] = [];
  departments: Department[] = [];
  selectedDepartmentId = 'all';
  searchTerm = '';
  
  showModal = false;
  newStudents: User[] = [];
  
  private subscriptions: Subscription[] = [];

  constructor(
    private userService: UserService,
    private classService: ClassService,
    private departmentService: DepartmentService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Subscribe to user changes
    const usersSub = this.userService.getUsersObservable().subscribe(users => {
      this.students = users.filter(u => u.role === 'S');
      console.log('Students loaded:', this.students);
      this.applyFilter();
      this.cdr.markForCheck();
    });
    this.subscriptions.push(usersSub);

    // Subscribe to department updates
    const deptSub = this.departmentService.departments$.subscribe(depts => {
      this.departments = depts;
      console.log('Departments loaded:', this.departments);
      this.cdr.markForCheck();
    });
    this.subscriptions.push(deptSub);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  getStudentId(student: User): string {
    return student.id || student._id || 'N/A';
  }

  getStudentName(student: User): string {
    if (student.name) {
      return student.name;
    }
    
    const parts = [
      student.firstName || '',
      student.middleName || '',
      student.lastName || ''
    ].filter(p => p.trim());
    
    return parts.join(' ') || 'N/A';
  }

  getDepartmentName(id: string): string {
    if (!id) return 'Not Assigned';
    const dept = this.departments.find(d => (d.id || d._id) === id);
    return dept ? dept.name : 'Unknown';
  }

  applyFilter() {
    let studentsToFilter = this.students;

    if (this.selectedDepartmentId !== 'all') {
      studentsToFilter = studentsToFilter.filter(s => 
        s.details?.departmentId === this.selectedDepartmentId
      );
    }

    if (this.searchTerm) {
      const lowercasedTerm = this.searchTerm.toLowerCase();
      studentsToFilter = studentsToFilter.filter(s => {
        const studentId = this.getStudentId(s).toLowerCase();
        const studentName = this.getStudentName(s).toLowerCase();
        const deptName = this.getDepartmentName(s.details?.departmentId).toLowerCase();
        const classId = (s.details?.classId || '').toLowerCase();
        
        return studentId.includes(lowercasedTerm) ||
               studentName.includes(lowercasedTerm) ||
               deptName.includes(lowercasedTerm) ||
               classId.includes(lowercasedTerm);
      });
    }
    
    this.filteredStudents = studentsToFilter.sort((a, b) => {
      const classIdA = a.details?.classId || '';
      const classIdB = b.details?.classId || '';
      if (classIdA < classIdB) return -1;
      if (classIdA > classIdB) return 1;
      return this.getStudentId(a).localeCompare(this.getStudentId(b));
    });
    
    this.cdr.markForCheck();
  }

  deleteStudent(student: User) {
    const studentId = this.getStudentId(student);
    const studentName = this.getStudentName(student);
    
    if (confirm(`Are you sure you want to delete student ${studentName} (${studentId})?`)) {
      this.classService.removeStudentFromAllClasses(studentId);
      this.userService.deleteUser(studentId);
    }
  }

  closeModal() {
    this.showModal = false;
    this.newStudents = [];
    this.cdr.markForCheck();
  }

  resetModal() {
    this.newStudents = [];
    this.cdr.markForCheck();
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    const target = event.target as HTMLElement;
    target.classList.add('border-primary');
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    const target = event.target as HTMLElement;
    target.classList.remove('border-primary');
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    const target = event.target as HTMLElement;
    target.classList.remove('border-primary');

    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.handleFile(event.dataTransfer.files[0]);
      event.dataTransfer.clearData();
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.handleFile(input.files[0]);
    }
  }

  handleFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      if (file.name.endsWith('.csv')) {
        this.newStudents = this.parseCsv(text);
      } else if (file.name.endsWith('.json')) {
        this.newStudents = JSON.parse(text);
      }
      this.showModal = true;
      this.cdr.markForCheck();
    };
    reader.readAsText(file);
  }

  parseCsv(text: string): User[] {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim());
    const students: User[] = [];

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i]) continue;
      const data = lines[i].split(',');
      const studentObj: any = {};

      headers.forEach((header, index) => {
        const value = data[index] ? data[index].trim() : '';
        const keys = header.split('.');
        let current = studentObj;

        keys.forEach((key, i) => {
          if (i === keys.length - 1) {
            current[key] = value;
          } else {
            current[key] = current[key] || {};
            current = current[key];
          }
        });
      });
      students.push(studentObj as User);
    }
    return students;
  }

  addStudents() {
    this.newStudents.forEach(student => {
      this.userService.addUser(student);
      if (student.details?.classId) {
        const classData = this.classService.getClassById(student.details.classId);
        if (classData) {
          const studentId = student.id || student._id || '';
          if (studentId && !classData.studentIds.includes(studentId)) {
            classData.studentIds.push(studentId);
            this.classService.updateClass(classData);
          }
        }
      }
    });
    
    alert(`${this.newStudents.length} students added successfully!`);
    this.showModal = false;
    this.newStudents = [];
    this.cdr.markForCheck();
  }

  downloadSampleJson() {
    const sampleData = [
      {
        id: 'S00003',
        firstName: 'John',
        middleName: 'Michael',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        role: 'S',
        details: {
          mobileNumber: '1234567890',
          dob: '01-01-2000',
          departmentId: 'D01',
          degree: 'B.Tech',
          prn: '2023016401665115',
          classId: 'C01',
          rollNo: '101',
          fees: { total: '5000', paid: '5000' },
        },
      }
    ];

    const jsonContent = JSON.stringify(sampleData, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'sample-students.json');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  downloadSample() {
    const sampleData = [
      ['id', 'firstName', 'middleName', 'lastName', 'email', 'role', 'details.mobileNumber', 'details.dob', 'details.departmentId', 'details.degree', 'details.prn', 'details.classId', 'details.rollNo', 'details.fees.total', 'details.fees.paid'],
      ['S00003', 'John', 'Michael', 'Doe', 'john.doe@example.com', 'S', '1234567890', '01-01-2000', 'D01', 'B.Tech', '2023016401665115', 'C01', '101', '5000', '5000']
    ];

    const csvContent = sampleData.map(e => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'sample-students.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}