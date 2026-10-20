import express from 'express';
import { checkSingleScheme, checkAllSchemes, getEligibilityHistory } from '../controllers/eligibilityController.js';
import { optionalAuth, authenticate } from '../middleware/auth.js';

const router = express.Router();

// Both guest and authenticated checks supported
router.post('/check-scheme/:schemeId', optionalAuth, checkSingleScheme);
router.post('/check-all', optionalAuth, checkAllSchemes);
router.get('/history', authenticate, getEligibilityHistory);

export default router;
