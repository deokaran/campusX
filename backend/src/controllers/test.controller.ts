import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import Test from '../models/test.model';

const toResponse = (test: any) => ({
  ...test.toObject(),
  id: test._id
});

export const createTest = async (req: Request, res: Response) => {
  try {
    const newTest = new Test({
      _id: req.body._id || uuidv4(),
      ...req.body
    });
    await newTest.save();

    res.status(201).json(toResponse(newTest));
  } catch (error) {
    console.error('Error creating test:', error);
    res.status(500).json({ message: 'Error creating test' });
  }
};

export const getTests = async (req: Request, res: Response) => {
  try {
    const tests = await Test.find();
    res.json(tests.map(test => toResponse(test)));
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tests' });
  }
};

export const getTestById = async (req: Request, res: Response) => {
  try {
    const test = await Test.findById(req.params.id);

    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }

    res.json(toResponse(test));
  } catch (error) {
    res.status(500).json({ message: 'Error fetching test' });
  }
};

export const updateTest = async (req: Request, res: Response) => {
  try {
    const updatedTest = await Test.findByIdAndUpdate(req.params.id, req.body, { new: true });

    if (!updatedTest) {
      return res.status(404).json({ message: 'Test not found' });
    }

    res.json(toResponse(updatedTest));
  } catch (error) {
    res.status(500).json({ message: 'Error updating test' });
  }
};

export const deleteTest = async (req: Request, res: Response) => {
  try {
    await Test.findByIdAndDelete(req.params.id);

    res.json({ message: 'Test deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting test' });
  }
};

export const getTestsByClass = async (req: Request, res: Response) => {
  try {
    const tests = await Test.find({ classId: req.params.classId });
    res.json(tests.map(test => toResponse(test)));
  } catch (error) {
    res.status(500).json({ message: 'Error fetching class tests' });
  }
};

const updateTestState = async (req: Request, res: Response, updates: Record<string, unknown>) => {
  try {
    const updatedTest = await Test.findByIdAndUpdate(req.params.id, updates, { new: true });

    if (!updatedTest) {
      return res.status(404).json({ message: 'Test not found' });
    }

    res.json(toResponse(updatedTest));
  } catch (error) {
    console.error('Error updating test state:', error);
    res.status(500).json({ message: 'Error updating test' });
  }
};

export const publishTest = async (req: Request, res: Response) => {
  return updateTestState(req, res, { status: 'Published' });
};

export const closeTest = async (req: Request, res: Response) => {
  return updateTestState(req, res, { status: 'Closed' });
};

export const resumeTest = async (req: Request, res: Response) => {
  return updateTestState(req, res, { status: 'Published' });
};

export const publishResults = async (req: Request, res: Response) => {
  return updateTestState(req, res, { resultsPublished: true });
};
