import express from 'express';
import { getMyBookmarks, addBookmark, removeBookmark, toggleBookmark } from '../controllers/bookmarkController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getMyBookmarks);
router.post('/', addBookmark);
router.post('/toggle/:schemeId', toggleBookmark);
router.delete('/:schemeId', removeBookmark);

export default router;
