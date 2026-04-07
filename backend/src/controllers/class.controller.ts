import { Request, Response } from 'express';
import Class from '../models/class.model';

// 🔹 Create Class
export const createClass = async (req: Request, res: Response) => {
  try {
    const newClass = new Class(req.body);
    await newClass.save();

    res.status(201).json(newClass);
  } catch (error) {
    res.status(500).json({ message: 'Error creating class' });
  }
};

// 🔹 Get All Classes
export const getClasses = async (req: Request, res: Response) => {
  try {
    const classes = await Class.find();
    res.json(classes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching classes' });
  }
};

// 🔹 Get Class by ID
export const getClassById = async (req: Request, res: Response) => {
  try {
    const classData = await Class.findById(req.params.id);

    if (!classData) {
      return res.status(404).json({ message: 'Class not found' });
    }

    res.json(classData);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching class' });
  }
};

// 🔹 Update Class
export const updateClass = async (req: Request, res: Response) => {
  try {
    const updatedClass = await Class.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updatedClass);
  } catch (error) {
    res.status(500).json({ message: 'Error updating class' });
  }
};

// 🔹 Delete Class
export const deleteClass = async (req: Request, res: Response) => {
  try {
    await Class.findByIdAndDelete(req.params.id);

    res.json({ message: 'Class deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting class' });
  }
};