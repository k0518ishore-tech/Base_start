import express from 'express';
import { getRulesByScheme, createRule, updateRule, deleteRule } from '../controllers/eligibilityRuleController.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/admin.js';

const router = express.Router();

router.get('/scheme/:schemeId', optionalAuth, getRulesByScheme);

// Admin only
router.post('/', authenticate, requireAdmin, createRule);
router.put('/:id', authenticate, requireAdmin, updateRule);
router.delete('/:id', authenticate, requireAdmin, deleteRule);

export default router;
