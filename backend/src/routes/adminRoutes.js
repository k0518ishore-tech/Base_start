import express from 'express';
import {
  getDashboardStats,
  getSystemNotifications,
  markSystemNotificationRead,
  markAllSystemNotificationsRead,
  getAdminRecommendations,
  updateRecommendationStatus,
  seedDemoRecommendation,
  getAuditLogs,
} from '../controllers/adminController.js';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/admin.js';

const router = express.Router();

router.use(authenticate, requireAdmin);

router.get('/dashboard', getDashboardStats);

// System Notifications
router.get('/system-notifications', getSystemNotifications);
router.patch('/system-notifications/read-all', markAllSystemNotificationsRead);
router.patch('/system-notifications/:id/read', markSystemNotificationRead);

// Recommendations from repeated feedback
router.get('/recommendations', getAdminRecommendations);
router.patch('/recommendations/:id/status', updateRecommendationStatus);
router.post('/recommendations/seed-demo', seedDemoRecommendation);

router.get('/audit-logs', getAuditLogs);

export default router;
