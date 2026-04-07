import mongoose, { Schema } from 'mongoose';

export interface IDepartment {
  _id: string;
  name: string;
  code: string;
  description?: string;
  headOfDepartment?: string;
} 

const departmentSchema = new Schema<IDepartment>({
  _id: { type: String, required: true },
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  description: { type: String },
  headOfDepartment: { type: String }
}, { timestamps: true });

export default mongoose.model<IDepartment>('Department', departmentSchema);
