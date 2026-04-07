import express from 'express';
import {
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment
} from '../controllers/department.controller';
import { verifyToken, authorizeRoles } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/', verifyToken, getDepartments);
router.get('/:id', verifyToken, getDepartmentById);
router.post('/', verifyToken, authorizeRoles('A'), createDepartment);
router.put('/:id', verifyToken, authorizeRoles('A'), updateDepartment);
router.delete('/:id', verifyToken, authorizeRoles('A'), deleteDepartment);

export default router;
