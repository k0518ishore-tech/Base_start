import express from 'express';
import { submitFeedback, getMyFeedback, getAllFeedback, replyFeedback } from '../controllers/feedbackController.js';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/admin.js';

const router = express.Router();

router.use(authenticate);

// Citizen routes
router.post('/', submitFeedback);
router.get('/my', getMyFeedback);

// Admin routes
router.get('/', requireAdmin, getAllFeedback);
router.patch('/:id', requireAdmin, replyFeedback);

export default router;
