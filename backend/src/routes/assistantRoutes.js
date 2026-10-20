import express from 'express';
import { handleChat } from '../controllers/assistantController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/chat', optionalAuth, handleChat);

export default router;
