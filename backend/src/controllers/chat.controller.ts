import { Request, Response } from 'express';
import ChatMessage from '../models/chat.model';
import User from '../models/user.model';

// 🔹 Send Message
export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { classId, senderId } = req.body;

    const student = await User.findOne({
      _id: senderId,
      role: 'S',
      'details.classId': classId
    });

    if (!student) {
      return res.status(403).json({ message: 'Only students assigned to this class can send messages' });
    }

    const newMessage = new ChatMessage({
      ...req.body,
      timestamp: new Date()
    });

    await newMessage.save();

    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ message: 'Error sending message' });
  }
};

// 🔹 Get Messages by Class
export const getMessagesByClass = async (req: Request, res: Response) => {
  try {
    const studentsInClass = await User.find({
      role: 'S',
      'details.classId': req.params.classId
    }).select('_id');

    const studentIds = studentsInClass.map(student => student._id);

    const messages = await ChatMessage.find({
      classId: req.params.classId,
      senderId: { $in: studentIds }
    }).sort({ timestamp: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching messages' });
  }
};

// 🔹 Delete Message
export const deleteMessage = async (req: Request, res: Response) => {
  try {
    await ChatMessage.findByIdAndDelete(req.params.id);

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting message' });
  }
};
