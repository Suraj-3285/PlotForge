import { Router } from "express";
import { inviteCollaborator,getCollaborator,updateCollaboratorRole,removeCollaborator,getMyCollaborations, } from "../controllers/collaborate.controller";
import { protect } from "../middlewares/auth.middleware";
const router = Router({ mergeParams: true});

router.get("/my/collaborations", protect, getMyCollaborations);
router.get("/:storyId/collaborators",protect,getCollaborator);
router.post("/:storyId/collaborators",protect,inviteCollaborator);
router.put("/:storyId/collaborators/:collaboratorId",protect,updateCollaboratorRole);
router.delete("/:storyId/collaborators/:collaboratorId",protect,removeCollaborator);

export default router;