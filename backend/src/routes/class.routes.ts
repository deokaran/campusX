import express from 'express';
import {
  createClass,
  getClasses,
  getClassById,
  updateClass,
  deleteClass
} from '../controllers/class.controller';

import { verifyToken, authorizeRoles } from '../middleware/auth.middleware';

const router = express.Router();

// 🔹 Create class (Admin only)
router.post('/', verifyToken, authorizeRoles('A'), createClass);

// 🔹 Get all classes
router.get('/', verifyToken, getClasses);

// 🔹 Get class by ID
router.get('/:id', verifyToken, getClassById);

// 🔹 Update class (Admin only)
router.put('/:id', verifyToken, authorizeRoles('A'), updateClass);

// 🔹 Delete class (Admin only)
router.delete('/:id', verifyToken, authorizeRoles('A'), deleteClass);

export default router;