import express from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { auditPrompt, generateVariations, runSimulation } from '../controllers/textController.js';

const router = express.Router();

// All routes protected by Passport session
router.post('/audit', requireAuth, auditPrompt);
router.post('/enhance', requireAuth, generateVariations);
router.post('/simulate', requireAuth, runSimulation);

export default router;