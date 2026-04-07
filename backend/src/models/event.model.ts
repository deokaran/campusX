import mongoose, { Schema } from 'mongoose';

export interface IEvent {
  _id: string;
  date: Date;
  name: string;
  description: string;
}

const eventSchema = new Schema<IEvent>({
  _id: { type: String, required: true },
  date: Date,
  name: String,
  description: String
});

export default mongoose.model<IEvent>('Event', eventSchema);