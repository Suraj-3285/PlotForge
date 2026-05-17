import { Response, NextFunction} from 'express';
import { AuthRequest } from './auth.middleware';
import prisma from '../config/db';

export const requireEditor = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const storyId = req.params.storyId;
        const userId = req.user!.id;

        const story = await prisma.story.findUnique({
            where: {id: storyId}
        });

        if (!story) {
            return res.status(404).json({message: 'Story not found.'});
        }

        if(story.authorId === userId) {
            return next();
        }

        const collaborator = await prisma.collaborator.findUnique({
            where: {
                storyId_userId: { storyId, userId}
            }
        });

        if (!collaborator || collaborator.role !== 'EDITOR') {
            return res.status(403).json({
                message: 'Access Denied. Editor role required.'
            });
        }

        next();
    } catch (error) {
        return res.status(500).json({message: 'Server error.'});
    }
};