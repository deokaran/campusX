import express from 'express';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  bulkAddUsers
} from '../controllers/user.controller';

import { verifyToken, authorizeRoles } from '../middleware/auth.middleware';

const router = express.Router();

// 🔹 Get all users (Admin only)
router.get('/', getAllUsers);

// 🔹 Create single user (Admin only)
router.post('/', createUser);

// 🔹 Bulk add users (Admin only)
router.post('/bulk', bulkAddUsers);

// 🔹 Get user by ID
router.get('/:id', getUserById);

// 🔹 Update user
router.put('/:id', updateUser);

// 🔹 Delete user (Admin only)
router.delete('/:id', deleteUser);

export default router;
