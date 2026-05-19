import { Router } from 'express';
import {rateEnding,deleteRating,getEndingRatings,getMyRating,
} from '../controllers/rating.controller';
import { protect } from '../middlewares/auth.middleware';

const router = Router({ mergeParams: true });

router.get('/:publishingId/ratings/me', protect, getMyRating);
router.get('/:publishingId/ratings', getEndingRatings);
router.post('/:publishingId/ratings', protect, rateEnding);
router.delete('/:publishingId/ratings', protect, deleteRating);

export default router;