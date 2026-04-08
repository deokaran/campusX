import express from 'express';
import {
  createTest,
  getTests,
  getTestById,
  updateTest,
  deleteTest,
  getTestsByClass,
  publishTest,
  closeTest,
  resumeTest,
  publishResults
} from '../controllers/test.controller';

import { verifyToken, authorizeRoles } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/', verifyToken, authorizeRoles('T', 'A'), createTest);
router.get('/', verifyToken, getTests);
router.get('/class/:classId', verifyToken, getTestsByClass);
router.get('/:id', verifyToken, getTestById);
router.put('/:id', verifyToken, authorizeRoles('T', 'A'), updateTest);
router.patch('/:id/publish', verifyToken, authorizeRoles('T', 'A'), publishTest);
router.patch('/:id/close', verifyToken, authorizeRoles('T', 'A'), closeTest);
router.patch('/:id/resume', verifyToken, authorizeRoles('T', 'A'), resumeTest);
router.patch('/:id/results', verifyToken, authorizeRoles('T', 'A'), publishResults);
router.delete('/:id', verifyToken, authorizeRoles('A'), deleteTest);

export default router;
