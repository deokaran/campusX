import mongoose, { Schema } from 'mongoose';

export interface IReceipt {
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
  studentId: { type: String, required: true },
  invoiceNumber: { type: String, required: true },
  receiptNumber: { type: String, required: true, unique: true },
  class: { type: String, required: true },
  name: { type: String, required: true },
  academicYear: { type: String, required: true },
  date: { type: Date, required: true },
  paymentMode: { type: String, required: true },
  items: [{ 
    description: { type: String, required: true },
    amount: { type: Number, required: true }
  }],
  total: { type: Number, required: true },
  totalInWords: { type: String, required: true }
}, {
  timestamps: true
});

export default mongoose.model<IReceipt>('Receipt', receiptSchema);