import express from 'express';
import {
  submitTest,
  getSubmissions,
  getSubmissionById,
  getSubmissionsByTest,
  getSubmissionsByStudent
} from '../controllers/submission.controller';

import { verifyToken, authorizeRoles } from '../middleware/auth.middleware';

const router = express.Router();

// 🔹 Submit test (Student only)
router.post('/', verifyToken, authorizeRoles('S'), submitTest);

// 🔹 Get all submissions (Teacher/Admin)
router.get('/', verifyToken, authorizeRoles('T', 'A'), getSubmissions);

// 🔹 Get submission by ID
router.get('/:id', verifyToken, getSubmissionById);

// 🔹 Get submissions by test
router.get('/test/:testId', verifyToken, authorizeRoles('T', 'A'), getSubmissionsByTest);

// 🔹 Get submissions by student
router.get('/student/:studentId', verifyToken, getSubmissionsByStudent);

export default router;