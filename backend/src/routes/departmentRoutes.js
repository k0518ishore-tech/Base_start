import express from 'express';
import {
  getAllDepartments,
  getDepartmentById,
  getDepartmentSchemes,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from '../controllers/departmentController.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/admin.js';

const router = express.Router();

// Public routes
router.get('/', optionalAuth, getAllDepartments);
router.get('/:id', optionalAuth, getDepartmentById);
router.get('/:id/schemes', optionalAuth, getDepartmentSchemes);

// Admin-only routes
router.post('/', authenticate, requireAdmin, createDepartment);
router.put('/:id', authenticate, requireAdmin, updateDepartment);
router.delete('/:id', authenticate, requireAdmin, deleteDepartment);

export default router;
