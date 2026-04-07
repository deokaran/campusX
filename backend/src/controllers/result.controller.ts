import { Request, Response } from 'express';
import Result from '../models/result.model';

// 🔹 Create Result
export const createResult = async (req: Request, res: Response) => {
  try {
    const newResult = new Result(req.body);
    await newResult.save();

    res.status(201).json(newResult);
  } catch (error) {
    res.status(500).json({ message: 'Error creating result' });
  }
};

// 🔹 Get All Results
export const getResults = async (req: Request, res: Response) => {
  try {
    const results = await Result.find();
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching results' });
  }
};

// 🔹 Get Result by ID
export const getResultById = async (req: Request, res: Response) => {
  try {
    const result = await Result.findById(req.params.id);

    if (!result) {
      return res.status(404).json({ message: 'Result not found' });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching result' });
  }
};

// 🔹 Get Results by Student
export const getResultsByStudent = async (req: Request, res: Response) => {
  try {
    const results = await Result.find({ studentId: req.params.studentId });
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching student results' });
  }
};

// 🔹 Update Result
export const updateResult = async (req: Request, res: Response) => {
  try {
    const updatedResult = await Result.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updatedResult);
  } catch (error) {
    res.status(500).json({ message: 'Error updating result' });
  }
};

// 🔹 Delete Result
export const deleteResult = async (req: Request, res: Response) => {
  try {
    await Result.findByIdAndDelete(req.params.id);

    res.json({ message: 'Result deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting result' });
  }
};