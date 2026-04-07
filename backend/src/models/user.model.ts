import mongoose, { Schema } from 'mongoose';

export type UserRole = 'S' | 'T' | 'A';

interface StudentDetails {
  fullName?: string;
  department?: string;
  departmentId?: string;
  degree?: string;
  yearSem?: string;
  batch?: string;
  mobile?: string;
  dob?: string;
  classId?: string;
  rollNo?: string;
  prn?: string;
  guardianNo?: string;
  avatarUrl?: string; // Base64 image
  fees?: {
    total: number;
    paid: number;
    due: number;
  };
}

interface TeacherDetails {
  fullName?: string;
  department?: string;
  departmentId?: string;
  specialization?: string;
  mobile?: string;
  dob?: string;
  joiningDate?: string;
  avatarUrl?: string; // Base64 image
}

interface AdminDetails {
  fullName?: string;
  role?: string;
  mobile?: string;
  dob?: string;
  joiningDate?: string;
  avatarUrl?: string; // Base64 image
}

export interface IUser {
  _id: string;
  name: string;
  email: string;
  password?: string; // Made optional for response objects
  role: UserRole;
  details: StudentDetails | TeacherDetails | AdminDetails;
}

// 🔹 Schema
const userSchema = new Schema<IUser>({
  _id: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['S', 'T', 'A'],
    required: true
  },
  details: {
    type: Schema.Types.Mixed,
    required: true
  }
}, { timestamps: true });

export default mongoose.model<IUser>('User', userSchema);
