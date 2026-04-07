import express from 'express';
import {
  createAttendance,
  getAttendance,
  getAttendanceById,
  updateAttendance,
  deleteAttendance
} from '../controllers/attendance.controller';

import { verifyToken, authorizeRoles } from '../middleware/auth.middleware';

const router = express.Router();

// 🔹 Create attendance record (Teachers only)
router.post('/', verifyToken, authorizeRoles('T', 'A'), createAttendance);

// 🔹 Get all attendance records
router.get('/', verifyToken, getAttendance);

// 🔹 Get attendance by ID
router.get('/:id', verifyToken, getAttendanceById);

// 🔹 Update attendance (Teachers and Admin only)
router.put('/:id', verifyToken, authorizeRoles('T', 'A'), updateAttendance);

// 🔹 Delete attendance (Teachers and Admin only)
router.delete('/:id', verifyToken, authorizeRoles('T', 'A'), deleteAttendance);

export default router;
