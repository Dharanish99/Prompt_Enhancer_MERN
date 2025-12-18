import express from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { getHistory } from '../controllers/historyController.js';

const router = express.Router();

console.log('✅ History routes loaded');

router.get('/', requireAuth, getHistory);

export default router;
