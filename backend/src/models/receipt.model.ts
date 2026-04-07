import mongoose, { Schema } from 'mongoose';

export interface IReceipt {
  _id: string;
  studentId: string;
  invoiceNumber: string;
  receiptNumber: string;
  class: string;
  name: string;
  academicYear: string;
  date: Date;
  paymentMode: string;
  items: any[];
  total: number;
  totalInWords: string;
}

const receiptSchema = new Schema<IReceipt>({
  _id: { type: String, required: true },
  studentId: String,
  invoiceNumber: String,
  receiptNumber: String,
  class: String,
  name: String,
  academicYear: String,
  date: Date,
  paymentMode: String,
  items: [{ type: Object }],
  total: Number,
  totalInWords: String
});

export default mongoose.model<IReceipt>('Receipt', receiptSchema);