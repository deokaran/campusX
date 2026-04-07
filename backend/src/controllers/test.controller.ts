import { Request, Response } from 'express';
import Test from '../models/test.model';

// 🔹 Create Test
export const createTest = async (req: Request, res: Response) => {
  try {
    const newTest = new Test(req.body);
    await newTest.save();

    res.status(201).json(newTest);
  } catch (error) {
    res.status(500).json({ message: 'Error creating test' });
  }
};

// 🔹 Get All Tests
export const getTests = async (req: Request, res: Response) => {
  try {
    const tests = await Test.find();
    res.json(tests);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tests' });
  }
};

// 🔹 Get Test by ID
export const getTestById = async (req: Request, res: Response) => {
  try {
    const test = await Test.findById(req.params.id);

    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }

    res.json(test);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching test' });
  }
};

// 🔹 Update Test
export const updateTest = async (req: Request, res: Response) => {
  try {
    const updatedTest = await Test.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updatedTest);
  } catch (error) {
    res.status(500).json({ message: 'Error updating test' });
  }
};

// 🔹 Delete Test
export const deleteTest = async (req: Request, res: Response) => {
  try {
    await Test.findByIdAndDelete(req.params.id);

    res.json({ message: 'Test deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting test' });
  }
};

// 🔹 Get Tests by Class
export const getTestsByClass = async (req: Request, res: Response) => {
  try {
    const tests = await Test.find({ classId: req.params.classId });
    res.json(tests);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching class tests' });
  }
};