import { Router } from 'express';
import { getMyProfile,getPublicProfile,updateProfile,uploadAvatar } from '../controllers/user.controller';
import { protect } from '../middlewares/auth.middleware';
import { upload } from '../config/cloudinary';

const router  = Router();

router.get('/me',protect,getMyProfile);
router.put('/me',protect,updateProfile);
router.post('/me/avatar',protect,upload.single('avatar'),uploadAvatar);

router.get('/:username',getPublicProfile);
export default router;