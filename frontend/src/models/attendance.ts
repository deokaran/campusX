export interface AttendanceRecord {
  id: string;
  classId: string;
  subjectCode: string;
  date: string; // YYYY-MM-DD format
  presentStudentIds: string[];
  teacherId: string;
  createdAt: Date;
}