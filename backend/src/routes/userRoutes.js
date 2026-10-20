import express from 'express';
import { getAllUsers, getUserById, toggleUserStatus } from '../controllers/userController.js';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/admin.js';

const router = express.Router();

router.use(authenticate, requireAdmin);

router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.patch('/:id/status', toggleUserStatus);

export default router;
