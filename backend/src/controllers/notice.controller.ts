import { Request, Response } from 'express';
import Notice from '../models/notice.model';

// 🔹 Create Notice
export const createNotice = async (req: Request, res: Response) => {
  try {
    const { _id, date, title, category, description } = req.body;

    // Validate required fields
    if (!_id || !date || !title || !description) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const newNotice = new Notice({
      _id,
      date: new Date(date),
      title,
      category: category || 'Academic',
      description
    });

    await newNotice.save();
    res.status(201).json(newNotice);
  } catch (error: any) {
    console.error('Error creating notice:', error);
    if (error.code === 11000) {
      res.status(400).json({ message: 'Notice with this ID already exists' });
    } else {
      res.status(500).json({ message: 'Error creating notice', error: error.message });
    }
  }
};

// 🔹 Get All Notices
export const getNotices = async (req: Request, res: Response) => {
  try {
    const notices = await Notice.find().sort({ date: -1 });
    res.json(notices);
  } catch (error: any) {
    console.error('Error fetching notices:', error);
    res.status(500).json({ message: 'Error fetching notices', error: error.message });
  }
};

// 🔹 Get Notice by ID
export const getNoticeById = async (req: Request, res: Response) => {
  try {
    const notice = await Notice.findById(req.params.id);

    if (!notice) {
      return res.status(404).json({ message: 'Notice not found' });
    }

    res.json(notice);
  } catch (error: any) {
    console.error('Error fetching notice:', error);
    res.status(500).json({ message: 'Error fetching notice', error: error.message });
  }
};

// 🔹 Update Notice
export const updateNotice = async (req: Request, res: Response) => {
  try {
    const { date, title, category, description } = req.body;

    const updateData: any = {};
    if (date) updateData.date = new Date(date);
    if (title) updateData.title = title;
    if (category) updateData.category = category;
    if (description) updateData.description = description;

    const updatedNotice = await Notice.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedNotice) {
      return res.status(404).json({ message: 'Notice not found' });
    }

    res.json(updatedNotice);
  } catch (error: any) {
    console.error('Error updating notice:', error);
    res.status(500).json({ message: 'Error updating notice', error: error.message });
  }
};

// 🔹 Delete Notice
export const deleteNotice = async (req: Request, res: Response) => {
  try {
    const deletedNotice = await Notice.findByIdAndDelete(req.params.id);

    if (!deletedNotice) {
      return res.status(404).json({ message: 'Notice not found' });
    }

    res.json({ message: 'Notice deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting notice:', error);
    res.status(500).json({ message: 'Error deleting notice', error: error.message });
  }
};
