import express from 'express';
import {
  setReminder,
  updateReminder,
  cancelReminder,
  completeReminder,
  getUpcomingReminders,
  getReminderHistory,
} from '../controllers/reminderController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.post('/', setReminder);
router.put('/:id', updateReminder);
router.patch('/:id/cancel', cancelReminder);
router.patch('/:id/complete', completeReminder);
router.get('/upcoming', getUpcomingReminders);
router.get('/history', getReminderHistory);

export default router;
