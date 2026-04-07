import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import Submission from '../models/submission.model';

// 🔹 Submit Test
export const submitTest = async (req: Request, res: Response) => {
  try {
    const submissionData = { ...req.body };
    if (!submissionData._id) {
      submissionData._id = uuidv4();
    }
    const newSubmission = new Submission({
      ...submissionData,
      submittedAt: new Date()
    });

    await newSubmission.save();

    res.status(201).json(newSubmission);
  } catch (error) {
    console.error('Error submitting test:', error);
    res.status(500).json({ message: 'Error submitting test', error: String(error) });
  }
};

// 🔹 Get All Submissions
export const getSubmissions = async (req: Request, res: Response) => {
  try {
    const submissions = await Submission.find();
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching submissions' });
  }
};

// 🔹 Get Submission by ID
export const getSubmissionById = async (req: Request, res: Response) => {
  try {
    const submission = await Submission.findById(req.params.id);

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    res.json(submission);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching submission' });
  }
};

// 🔹 Get Submissions by Test
export const getSubmissionsByTest = async (req: Request, res: Response) => {
  try {
    const submissions = await Submission.find({ testId: req.params.testId });
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching test submissions' });
  }
};

// 🔹 Get Submissions by Student
export const getSubmissionsByStudent = async (req: Request, res: Response) => {
  try {
    const submissions = await Submission.find({ studentId: req.params.studentId });
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching student submissions' });
  }
};