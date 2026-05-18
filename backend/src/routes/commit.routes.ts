import { Router } from 'express';
import {createCommit,getCommits,getCommit,getLatestCommit,} from '../controllers/commit.controller';
import { protect } from '../middlewares/auth.middleware';
import { requireEditor } from '../middlewares/role.middleware';

const router = Router({ mergeParams: true });

router.get('/', protect, getCommits);
router.get('/latest', protect, getLatestCommit);
router.get('/:commitId', protect, getCommit);
router.post('/', protect, requireEditor, createCommit);

export default router;