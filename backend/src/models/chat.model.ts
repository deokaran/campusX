import mongoose, { Schema } from 'mongoose';

export interface IChatMessage {
  _id?: string;
  classId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  timestamp: Date;
}

const chatSchema = new Schema<IChatMessage>({
  classId: String,
  senderId: String,
  senderName: String,
  senderAvatar: String,
  text: String,
  timestamp: Date
}, { timestamps: true });

export default mongoose.model<IChatMessage>('ChatMessage', chatSchema);
