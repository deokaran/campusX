import express from 'express';
import {
  createResult,
  getResults,
  getResultById,
  getResultsByStudent,
  updateResult,
  deleteResult
} from '../controllers/result.controller';

import { verifyToken, authorizeRoles } from '../middleware/auth.middleware';

const router = express.Router();

// 🔹 Create result (Admin only)
router.post('/', verifyToken, authorizeRoles('A'), createResult);

// 🔹 Get all results (Admin/Teacher)
router.get('/', verifyToken, authorizeRoles('A', 'T'), getResults);

// 🔹 Get result by ID
router.get('/:id', verifyToken, getResultById);

// 🔹 Get results by student
router.get('/student/:studentId', verifyToken, getResultsByStudent);

// 🔹 Update result (Admin only)
router.put('/:id', verifyToken, authorizeRoles('A'), updateResult);

// 🔹 Delete result (Admin only)
router.delete('/:id', verifyToken, authorizeRoles('A'), deleteResult);

export default router;