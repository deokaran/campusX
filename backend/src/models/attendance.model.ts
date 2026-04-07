import mongoose, { Schema } from 'mongoose';

export interface IAttendance {
  _id: string;
  classId: string;
  subjectCode: string;
  date: string; // YYYY-MM-DD format
  presentStudentIds: string[];
  teacherId: string;
  createdAt: Date;
}

const attendanceSchema = new Schema<IAttendance>({
  _id: { type: String, required: true },
  classId: { type: String, required: true },
  subjectCode: { type: String, required: true },
  date: { type: String, required: true },
  presentStudentIds: [{ type: String }],
  teacherId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IAttendance>('Attendance', attendanceSchema);
