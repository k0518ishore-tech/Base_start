import express from 'express';
import {
  getAllSchemes,
  getSchemeById,
  getRecommendedSchemes,
  createScheme,
  updateScheme,
  deleteScheme,
  updateVerificationStatus,
} from '../controllers/schemeController.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/admin.js';

const router = express.Router();

// Public routes
router.get('/', optionalAuth, getAllSchemes);
router.get('/recommended', optionalAuth, getRecommendedSchemes);
router.get('/:id', optionalAuth, getSchemeById);

// Admin-only routes
router.post('/', authenticate, requireAdmin, createScheme);
router.put('/:id', authenticate, requireAdmin, updateScheme);
router.delete('/:id', authenticate, requireAdmin, deleteScheme);
router.patch('/:id/verification', authenticate, requireAdmin, updateVerificationStatus);

export default router;
