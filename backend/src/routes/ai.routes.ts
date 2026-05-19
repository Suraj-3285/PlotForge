import { Router } from 'express';
import { suggestNext,suggestTwist,improveWriting,fixGrammar,generateSummary, } from '../controllers/ai.controller';

import { protect } from '../middlewares/auth.middleware';

const router = Router();

// All AI routes are protected
router.post('/suggest-next', protect, suggestNext);
router.post('/suggest-twist', protect, suggestTwist);
router.post('/improve', protect, improveWriting);
router.post('/fix-grammar', protect, fixGrammar);
router.get('/summary/:branchId', protect, generateSummary);

export default router;