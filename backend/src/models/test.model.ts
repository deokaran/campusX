import mongoose, { Schema } from 'mongoose';

export interface ITest {
  _id: string;
  title: string;
  subject: string;
  classId: string;
  createdBy: string;
  status: string;
  resultsPublished: boolean;
  questions: any[];
}

const testSchema = new Schema<ITest>({
  _id: { type: String, required: true },
  title: String,
  subject: String,
  classId: String,
  createdBy: String,
  status: String,
  resultsPublished: Boolean,
  questions: [{ type: Object }]
});

export default mongoose.model<ITest>('Test', testSchema);