import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DepartmentService } from '../../services/department.service';
import { UserService } from '../../services/user.service';
import { ClassService } from '../../services/class.service';
import { Department } from '../../models/department';
import { User } from '../../models/user';

@Component({
  selector: 'app-department-detail',
  imports: [CommonModule, FormsModule],
  templateUrl: './department-detail.component.html',
  styleUrls: ['./department-detail.component.scss']
})
export class DepartmentDetailComponent implements OnInit {
  route = inject(ActivatedRoute);
  router = inject(Router);
  departmentService = inject(DepartmentService);
  userService = inject(UserService);
  classService = inject(ClassService);

  department: Department | undefined;
  totalStudents = 0;
  totalTeachers = 0;
  totalClasses = 0;
  departmentTeachers: User[] = [];
  
  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadDepartment(id);
    }
  }

  loadDepartment(id: string) {
    this.department = this.departmentService.getDepartmentById(id);
    if (this.department) {
      this.calculateStats(id);
    } else {
      this.router.navigate(['/admin/manage-departments']);
    }
  }

  calculateStats(deptId: string) {
    const allUsers = this.userService.getUsers();
    const allClasses = this.classService.getClasses();

    this.totalStudents = allUsers.filter(u => u.role === 'S' && u.details.departmentId === deptId).length;
    this.departmentTeachers = allUsers.filter(u => u.role === 'T' && u.details.departmentId === deptId);
    this.totalTeachers = this.departmentTeachers.length;
    
    // Check if classes have departmentId (added in previous step)
    // If not, we might need to rely on something else, but we added departmentId to classes.json
    this.totalClasses = allClasses.filter((c: any) => c.departmentId === deptId).length;
  }

  assignHOD(teacherId: string) {
    if (this.department) {
      this.department.headOfDepartment = teacherId;
      this.departmentService.updateDepartment(this.department);
      alert('Head of Department assigned successfully!');
    }
  }
}
