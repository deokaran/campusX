import mongoose, { Schema } from 'mongoose';

export interface IClass {
  _id: string;
  name: string;
  teacherIds: string[];
  studentIds: string[];
  subjects: any[];
  timeTable: any[];
}

const classSchema = new Schema<IClass>({
  _id: { type: String, required: true },
  name: { type: String, required: true },
  teacherIds: [{ type: String }],
  studentIds: [{ type: String }],
  subjects: [{ type: Object }],
  timeTable: [{ type: Object }]
});

export default mongoose.model<IClass>('Class', classSchema);