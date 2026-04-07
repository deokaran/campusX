import express from 'express';
import {
  createReceipt,
  getReceipts,
  getReceiptById,
  getReceiptsByStudent,
  updateReceipt,
  deleteReceipt
} from '../controllers/receipt.controller';

import { verifyToken, authorizeRoles } from '../middleware/auth.middleware';

const router = express.Router();

// 🔹 Create receipt (Admin only)
router.post('/', verifyToken, authorizeRoles('A'), createReceipt);

// 🔹 Get all receipts (Admin)
router.get('/', verifyToken, authorizeRoles('A'), getReceipts);

// 🔹 Get receipts by student (must be before /:id)
router.get('/student/:studentId', verifyToken, getReceiptsByStudent);

// 🔹 Get receipt by ID
router.get('/:id', verifyToken, getReceiptById);

// 🔹 Update receipt (Admin only)
router.put('/:id', verifyToken, authorizeRoles('A'), updateReceipt);

// 🔹 Delete receipt (Admin only)
router.delete('/:id', verifyToken, authorizeRoles('A'), deleteReceipt);

export default router;