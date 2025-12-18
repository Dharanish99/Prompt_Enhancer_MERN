import express from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { getTemplates, createTemplate, useTemplate } from '../controllers/templateController.js';
import { remixTemplate } from '../controllers/templateController.js';

const router = express.Router();

// Public: View templates
router.get('/', getTemplates);

// Protected: Create template (Only logged in users)
router.post('/', requireAuth, createTemplate);

// Public/Protected: Track usage
router.post('/:id/use', useTemplate);

router.post('/remix', requireAuth, remixTemplate); // Protected route

export default router;