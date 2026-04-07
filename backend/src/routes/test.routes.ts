import express from 'express';
import {
  createTest,
  getTests,
  getTestById,
  updateTest,
  deleteTest,
  getTestsByClass
} from '../controllers/test.controller';

import { verifyToken, authorizeRoles } from '../middleware/auth.middleware';

const router = express.Router();

// 🔹 Create Test (Teacher/Admin)
router.post('/', verifyToken, authorizeRoles('T', 'A'), createTest);

// 🔹 Get all tests
router.get('/', verifyToken, getTests);

// 🔹 Get tests by class (must be before /:id to avoid param collision)
router.get('/class/:classId', verifyToken, getTestsByClass);

// 🔹 Get test by ID
router.get('/:id', verifyToken, getTestById);

// 🔹 Update test (Teacher/Admin)
router.put('/:id', verifyToken, authorizeRoles('T', 'A'), updateTest);

// 🔹 Delete test (Admin only)
router.delete('/:id', verifyToken, authorizeRoles('A'), deleteTest);

export default router;