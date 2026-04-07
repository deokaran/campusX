import mongoose, { Schema } from 'mongoose';

export interface ISubmission {
  _id: string;
  testId: string;
  studentId: string;
  answers: any;
  score: number;
  totalMarks: number;
  submittedAt: Date;
}

const submissionSchema = new Schema<ISubmission>({
  _id: { type: String, required: true },
  testId: String,
  studentId: String,
  answers: { type: Object },
  score: Number,
  totalMarks: Number,
  submittedAt: Date
});

export default mongoose.model<ISubmission>('Submission', submissionSchema);