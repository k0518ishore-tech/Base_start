import express from 'express';
import { logSearch, getRecentSearches, clearSearchHistory } from '../controllers/searchHistoryController.js';
import { optionalAuth, authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/log', optionalAuth, logSearch);
router.get('/recent', authenticate, getRecentSearches);
router.delete('/clear', authenticate, clearSearchHistory);

export default router;
