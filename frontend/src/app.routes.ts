
import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { StudentLayoutComponent } from './student/student-layout.component';
import { StudentOverviewComponent } from './student/overview/student-overview.component';
import { TeacherLayoutComponent } from './teacher/teacher-layout.component';
import { TeacherOverviewComponent } from './teacher/overview/teacher-overview.component';
import { AdminLayoutComponent } from './admin/admin-layout.component';
import { AdminOverviewComponent } from './admin/overview/admin-overview.component';
import { authGuard } from './guards/auth.guard';
import { SubjectsComponent } from './student/subjects/subjects.component';
import { TestsComponent } from './student/tests/tests.component';
import { TakeTestComponent } from './student/take-test/take-test.component';
import { TestResultComponent } from './student/test-result/test-result.component';
import { SemesterResultsComponent } from './student/semester-results/semester-results.component';
import { DuesApprovalsComponent } from './student/dues-approvals/dues-approvals.component';
import { TimeTableComponent } from './student/time-table/time-table.component';
import { EventsComponent } from './student/events/events.component';
import { ProfileComponent } from './shared/profile/profile.component';
import { MyClassesComponent } from './teacher/my-classes/my-classes.component';
import { CreateTestComponent } from './teacher/create-test/create-test.component';
import { ManageTestsComponent } from './teacher/manage-tests/manage-tests.component';
import { ManageAdminsComponent } from './admin/manage-admins.component';
import { AddAdminComponent } from './admin/add-admin.component';
import { ManageTeachersComponent } from './admin/manage-teachers/manage-teachers.component';
import { EditTeacherComponent } from './admin/edit-teacher/edit-teacher.component';
import { ManageStudentsComponent as AdminManageStudentsComponent } from './admin/manage-students/manage-students.component';
import { EditStudentNewComponent } from './admin/edit-student-new/edit-student-new.component';
import { ManageClassesComponent } from './admin/manage-classes/manage-classes.component';
import { EditClassComponent } from './admin/edit-class/edit-class.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ClassDetailComponent } from './teacher/class-detail/class-detail.component';
import { TestSubmissionsComponent } from './teacher/test-submissions/test-submissions.component';

import { StudentResultsComponent as TeacherStudentResultsComponent } from './teacher/student-results/student-results.component';
import { ManageFeesComponent } from './admin/manage-fees/manage-fees.component';
import { ChatroomComponent } from './student/chatroom/chatroom.component';
import { AttendanceComponent } from './teacher/attendance/attendance.component';
import { AttendanceComponent as StudentAttendanceComponent } from './student/attendance/attendance.component';
import { ManageResultsComponent } from './admin/manage-results/manage-results.component';
import { ManageNoticesComponent } from './admin/manage-notices/manage-notices.component';
import { ClassPerformanceComponent } from './teacher/class-performance/class-performance.component';

import { PracticeComponent } from './student/practice/practice.component';

import { ManageDepartmentsComponent } from './admin/manage-departments/manage-departments.component';

import { DepartmentDetailComponent } from './admin/department-detail/department-detail.component';

export const appRoutes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  {
    path: 'student',
    component: StudentLayoutComponent,
    canActivate: [authGuard],
    data: { role: 'S' },
    children: [
      { path: 'overview', component: StudentOverviewComponent, data: { title: 'Overview', breadcrumb: 'Overview' } },
      { path: 'subjects', component: SubjectsComponent, data: { title: 'Subjects', breadcrumb: 'Subjects' } },
      { path: 'tests', component: TestsComponent, data: { title: 'Tests', breadcrumb: 'Tests' } },
      { path: 'tests/take/:id', component: TakeTestComponent, data: { title: 'Take Test', breadcrumb: 'Take Test' } },
      { path: 'tests/result/:id', component: TestResultComponent, data: { title: 'Test Result', breadcrumb: 'Test Result' } },
      { path: 'code-editor', component: PracticeComponent, data: { title: 'Code Editor', breadcrumb: 'Code Editor' } },
      { path: 'semester-results', component: SemesterResultsComponent, data: { title: 'Semester Results', breadcrumb: 'Semester Results' } },
      { path: 'fees', component: DuesApprovalsComponent, data: { title: 'My Fees', breadcrumb: 'Fees' } },
      
      { path: 'time-table', component: TimeTableComponent, data: { title: 'Time Table', breadcrumb: 'Time Table' } },
      { path: 'attendance', component: StudentAttendanceComponent, data: { title: 'My Attendance', breadcrumb: 'Attendance' } },
      { path: 'chatroom', component: ChatroomComponent, data: { title: 'Chatroom', breadcrumb: 'Chatroom' } },
      { path: 'profile', component: ProfileComponent, data: { title: 'My Profile', breadcrumb: 'Profile' } },
      { path: '', redirectTo: 'overview', pathMatch: 'full' }
    ]
  },
  {
    path: 'teacher',
    component: TeacherLayoutComponent,
    canActivate: [authGuard],
    data: { role: 'T' },
    children: [
      { path: 'overview', component: TeacherOverviewComponent, data: { title: 'Overview', breadcrumb: 'Overview' } },
      { path: 'my-classes', component: MyClassesComponent, data: { title: 'My Classes', breadcrumb: 'My Classes' } },
      { path: 'my-classes/:classId', component: ClassDetailComponent, data: { title: 'Class Details', breadcrumb: 'Class Details' } },
      { path: 'my-classes/:classId/performance', component: ClassPerformanceComponent, data: { title: 'Class Performance', breadcrumb: 'Performance' } },
      
      { path: 'student-results/:studentId', component: TeacherStudentResultsComponent, data: { title: 'Student Results', breadcrumb: 'Student Results' } },
      { path: 'attendance', component: AttendanceComponent, data: { title: 'Attendance', breadcrumb: 'Attendance' } },
      { path: 'create-test', component: CreateTestComponent, data: { title: 'Create Test', breadcrumb: 'Create Test' } },
      { path: 'manage-tests', component: ManageTestsComponent, data: { title: 'Manage Tests', breadcrumb: 'Manage Tests' } },
      { path: 'manage-tests/:id/submissions', component: TestSubmissionsComponent, data: { title: 'Test Submissions', breadcrumb: 'Submissions' } },
      { path: 'notices', component: EventsComponent, data: { title: 'Notices', breadcrumb: 'Notices' } },
      { path: 'profile', component: ProfileComponent, data: { title: 'My Profile', breadcrumb: 'Profile' } },
      { path: '', redirectTo: 'overview', pathMatch: 'full' }
    ]
  },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [authGuard],
    data: { role: 'A' },
    children: [
      { path: 'overview', component: AdminOverviewComponent, data: { title: 'Overview', breadcrumb: 'Overview' } },
      { path: 'manage-admins', component: ManageAdminsComponent, data: { title: 'Manage Admins', breadcrumb: 'Manage Admins' } },
      { path: 'add-admin', component: AddAdminComponent, data: { title: 'Add Admin', breadcrumb: 'Add Admin' } },
      { path: 'add-admin/:id', component: AddAdminComponent, data: { title: 'Edit Admin', breadcrumb: 'Edit Admin' } },
      { path: 'manage-teachers', component: ManageTeachersComponent, data: { title: 'Manage Teachers', breadcrumb: 'Manage Teachers' } },
      { path: 'manage-teachers/add', component: EditTeacherComponent, data: { title: 'Add Teacher', breadcrumb: 'Add' } },
      { path: 'manage-teachers/edit/:id', component: EditTeacherComponent, data: { title: 'Edit Teacher', breadcrumb: 'Edit' } },
      { path: 'manage-students', component: AdminManageStudentsComponent, data: { title: 'Manage Students', breadcrumb: 'Manage Students' } },
      { path: 'manage-students/add', component: EditStudentNewComponent, data: { title: 'Add Student', breadcrumb: 'Add' } },
      { path: 'manage-students/edit/:id', component: EditStudentNewComponent, data: { title: 'Edit Student', breadcrumb: 'Edit' } },
      { path: 'manage-classes', component: ManageClassesComponent, data: { title: 'Manage Classes', breadcrumb: 'Manage Classes' } },
      { path: 'manage-classes/add', component: EditClassComponent, data: { title: 'Add Class', breadcrumb: 'Add' } },
      { path: 'manage-classes/edit/:id', component: EditClassComponent, data: { title: 'Edit Class', breadcrumb: 'Edit' } },
      { path: 'manage-departments', component: ManageDepartmentsComponent, data: { title: 'Manage Departments', breadcrumb: 'Manage Departments' } },
      { path: 'manage-departments/:id', component: DepartmentDetailComponent, data: { title: 'Department Details', breadcrumb: 'Department Details' } },
      { path: 'manage-fees', component: ManageFeesComponent, data: { title: 'Manage Fees', breadcrumb: 'Manage Fees' } },
      { path: 'manage-results', component: ManageResultsComponent, data: { title: 'Manage Results', breadcrumb: 'Manage Results' } },
      { path: 'manage-notices', component: ManageNoticesComponent, data: { title: 'Manage Notices', breadcrumb: 'Manage Notices' } },
      { path: 'profile', component: ProfileComponent, data: { title: 'My Profile', breadcrumb: 'Profile' } },
      { path: '', redirectTo: 'overview', pathMatch: 'full' }
    ]
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];
