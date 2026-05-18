import { Router } from 'express';
import { createStory,getMyStories,getStory,updateStory,deleteStory,uploadCover,discoverStories } from '../controllers/story.controller';
import { protect } from '../middlewares/auth.middleware';
import { upload } from '../config/cloudinary';

const router = Router();
//public
router.get('/discover',discoverStories);

//protected
router.post('/',protect,createStory);
router.get('/my/all',protect,getMyStories);
router.get('/:storyId',protect,getStory);
router.put('/:storyId', protect, updateStory);
router.delete('/:storyId', protect, deleteStory);
router.post('/:storyId/cover', protect, upload.single('cover'), uploadCover);

export default router;


