import { Router } from 'express';
import { createBranch,getBranches,getBranch,getBranchTree,deleteBranch } from '../controllers/branch.controller';
import { protect } from '../middlewares/auth.middleware';
import { requireEditor } from '../middlewares/role.middleware';
const router = Router({ mergeParams: true});

router.get('/', protect, getBranches);
router.get('/tree', protect, getBranchTree);
router.get('/:branchId', protect, getBranch);
router.post('/', protect, requireEditor, createBranch);
router.delete('/:branchId', protect, requireEditor, deleteBranch);

export default router;