import express from 'express';
import {
  sendMessage,
  getMessagesByClass,
  deleteMessage
} from '../controllers/chat.controller';

import { verifyToken } from '../middleware/auth.middleware';

const router = express.Router();

// 🔹 Send message (any logged-in user)
router.post('/', verifyToken, sendMessage);

// 🔹 Get messages by class
router.get('/class/:classId', verifyToken, getMessagesByClass);

// 🔹 Delete message (optional: admin only if needed)
router.delete('/:id', verifyToken, deleteMessage);

export default router;