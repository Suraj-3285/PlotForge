import { Router } from "express";
import { publishBranch,unpublishBranch,getPublishedEndings,readEnding } from "../controllers/publish.controller";
import { protect } from "../middlewares/auth.middleware";

const router = Router({mergeParams: true});

//public read
router.get('/endings/:publishingId',readEnding);

//story ending
router.get('/:storyId/endings',getPublishedEndings);
router.post('/:storyId/publish',protect,publishBranch);
router.put('/:storyId/endings/:publishingId/unpublish',protect,unpublishBranch);

export default router;