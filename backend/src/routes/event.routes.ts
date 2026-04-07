import express from 'express';
import {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent
} from '../controllers/event.controller';

import { verifyToken, authorizeRoles } from '../middleware/auth.middleware';

const router = express.Router();

// 🔹 Create event (Admin only)
router.post('/', verifyToken, authorizeRoles('A'), createEvent);

// 🔹 Get all events (everyone logged in)
router.get('/', verifyToken, getEvents);

// 🔹 Get event by ID
router.get('/:id', verifyToken, getEventById);

// 🔹 Update event (Admin only)
router.put('/:id', verifyToken, authorizeRoles('A'), updateEvent);

// 🔹 Delete event (Admin only)
router.delete('/:id', verifyToken, authorizeRoles('A'), deleteEvent);

export default router;