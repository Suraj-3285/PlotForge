import { Router }  from "express";
import { exportBranch,exportCompiled } from "../controllers/export.controller";
import { protect } from "../middlewares/auth.middleware";

const router = Router({ mergeParams: true});

router.get("/:storyId/branches/:branchId/export/compiled",protect,exportCompiled,);

router.get("/:storyId/branches/:branchId/export",protect,exportBranch);

export default router;