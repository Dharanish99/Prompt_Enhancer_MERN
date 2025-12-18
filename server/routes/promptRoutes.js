import express from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { analyzePrompt, finalizePrompt, instantEnhance } from '../controllers/promptController.js';

const router = express.Router();

router.post('/analyze-prompt', requireAuth, analyzePrompt);
router.post('/finalize-prompt', requireAuth, finalizePrompt);
router.post('/image-enhance', requireAuth, instantEnhance);

export default router;