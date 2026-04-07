import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DepartmentService } from '../../services/department.service';
import { Department } from '../../models/department';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-manage-departments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './manage-departments.component.html',
  styleUrls: ['./manage-departments.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ManageDepartmentsComponent implements OnInit {
  departments: Department[] = [];
  showAddModal = false;
  newDepartment: Partial<Department> = { 
    _id: '',
    name: '', 
    code: '',
    description: '',
    headOfDepartment: ''
  };

  constructor(
    private departmentService: DepartmentService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadDepartments();
    
    // Subscribe to department changes
    this.departmentService.getDepartmentsObservable().subscribe(departments => {
      console.log('Departments updated:', departments);
      this.departments = departments;
      this.cdr.markForCheck();
    });
  }

  loadDepartments() {
    this.departments = this.departmentService.getDepartments();
    console.log('Current departments:', this.departments);
    this.cdr.markForCheck();
  }

  viewDepartment(id: string) {
    this.router.navigate(['/admin/manage-departments', id]);
  }

  openAddModal() {
    // Generate next department ID
    const nextId = this.generateNextDepartmentId();
    this.newDepartment = { 
      _id: nextId,
      name: '', 
      code: '',
      description: '',
      headOfDepartment: ''
    };
    this.showAddModal = true;
    this.cdr.markForCheck();
  }

  closeAddModal() {
    this.showAddModal = false;
    this.cdr.markForCheck();
  }

  generateNextDepartmentId(): string {
    const depts = this.departmentService.getDepartments();
    
    if (depts.length === 0) {
      return 'DEPT-001';
    }
    
    // Find highest department number
    const ids = depts.map(d => {
      const id = d.id || d._id || '';
      const match = id.match(/DEPT-(\d+)/);
      return match ? parseInt(match[1]) : 0;
    });
    
    const maxId = Math.max(...ids, 0);
    const nextId = maxId + 1;
    
    return 'DEPT-' + nextId.toString().padStart(3, '0');
  }

  addDepartment() {
    if (this.newDepartment.name && this.newDepartment.code) {
      console.log('Adding new department:', this.newDepartment);
      
      this.departmentService.addDepartment(this.newDepartment).subscribe({
        next: (dept) => {
          console.log('Department added successfully!', dept);
          alert('Department added successfully!');
          this.closeAddModal();
          // Reload departments
          setTimeout(() => {
            this.loadDepartments();
          }, 200);
        },
        error: (error) => {
          console.error('Error adding department:', error);
          alert('Error adding department: ' + (error.error?.message || error.message));
        }
      });
    } else {
      alert('Please fill in all required fields (Name and Code)');
    }
  }

  deleteDepartment(deptId: string) {
    if (confirm('Are you sure you want to delete this department?')) {
      this.departmentService.deleteDepartment(deptId).subscribe({
        next: () => {
          console.log('Department deleted successfully');
          alert('Department deleted successfully!');
          this.loadDepartments();
        },
        error: (error) => {
          console.error('Error deleting department:', error);
          alert('Error deleting department: ' + (error.error?.message || error.message));
        }
      });
    }
  }
}
