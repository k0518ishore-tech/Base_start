import express from 'express';
import {
  getDashboardStats,
  getSystemNotifications,
  markSystemNotificationRead,
  getAuditLogs,
} from '../controllers/adminController.js';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/admin.js';

const router = express.Router();

router.use(authenticate, requireAdmin);

router.get('/dashboard', getDashboardStats);
router.get('/system-notifications', getSystemNotifications);
router.patch('/system-notifications/:id/read', markSystemNotificationRead);
router.get('/audit-logs', getAuditLogs);

export default router;
