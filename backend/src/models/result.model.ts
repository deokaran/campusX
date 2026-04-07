import mongoose, { Schema } from 'mongoose';

export interface IResult {
  _id: string;
  studentId: string;
  semester: number;
  prn: string;
  seatNo: string;
  examMonthYear: string;
  finalRemarks: string;
  subjects: any[];
}

const resultSchema = new Schema<IResult>({
  _id: { type: String, required: true },
  studentId: String,
  semester: Number,
  prn: String,
  seatNo: String,
  examMonthYear: String,
  finalRemarks: String,
  subjects: [{ type: Object }]
});

export default mongoose.model<IResult>('Result', resultSchema);