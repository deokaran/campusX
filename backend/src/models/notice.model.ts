import mongoose, { Schema } from 'mongoose';

export interface INotice {
  _id: string;
  date: Date;
  title: string;
  category: 'Administrative' | 'Academic' | 'Event' | 'Other';
  description: string;
}

const noticeSchema = new Schema<INotice>({
  _id: { type: String, required: true },
  date: { type: Date, required: true },
  title: { type: String, required: true },
  category: { 
    type: String, 
    required: true,
    enum: ['Administrative', 'Academic', 'Event', 'Other'],
    default: 'Academic'
  },
  description: { type: String, required: true }
}, {
  timestamps: true
});

export default mongoose.model<INotice>('Notice', noticeSchema);
