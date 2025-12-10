import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { analyzePrompt, finalizePrompt, instantEnhance, getHistory } from '../controllers/promptController.js';

const router = express.Router();

// Public Route (If you want non-logged in users to use analysis, remove requireAuth)
// But for "Pro" security, we protect everything.
router.post('/analyze-prompt', requireAuth, analyzePrompt);
router.post('/finalize-prompt', requireAuth, finalizePrompt);
router.post('/image-enhance', requireAuth, instantEnhance);
router.get('/history', requireAuth, getHistory);

export default router;