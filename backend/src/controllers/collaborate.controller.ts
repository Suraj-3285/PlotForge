import { Response } from "express";
import { z } from 'zod';
import { AuthRequest } from "../middlewares/auth.middleware";
import prisma from "../config/db";

const inviteSchema = z.object({
    username: z.string().min(1,"Username is required"),
    role: z.enum(["VIEWER","EDITOR"]).default("VIEWER"),
});

const updateRoleSchema = z.object({
    role: z.enum(["VIEWER","EDITOR"]),
});

//invite collaborator

export const inviteCollaborator = async (req: AuthRequest, res: Response) => {
    try{
        const { storyId } = req.params;
        const userId = req.user!.id;

        const parsed = inviteSchema.safeParse(req.body);
        if(!parsed.success){
            return res.status(400).json({
                message: parsed.error.issues[0].message,
            });
        }
        const { username,role} = parsed.data;

        const story = await prisma.story.findUnique({
            where: { id: storyId as string},
        });

        if(!story){
            return res.status(404).json({message: "Stroy not found"});
        }
        if(story.authorId != userId){
            return res.status(403).json({
                message: "Only the author can invite collaborators",
            });
        }

        //find the user to invite
        const invitedUser = await prisma.user.findUnique({
            where: { username },
        });
        if(!invitedUser){
            return res.status(404).json({ message: "User not found"});
        }

        //cant invite urself
        if(invitedUser.id === userId){
            return res.status(400).json({
                message: "You cannot invite yourself",
            });
        }

        //check if already a collaborator
        const existing = await prisma.collaborator.findUnique({
            where: {
                storyId_userId: {
                    storyId: storyId as string,
                    userId: invitedUser.id,
                },
            },
        });
        if(existing){
            return res.status(400).json({
                message: "User is already a collaborator",
            });
        }

        const collaborator = await prisma.collaborator.create({
            data: {
                storyId: storyId as string,
                userId: invitedUser.id,
                role,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        name: true,
                        avatar: true,
                    },
                },
            },
        });
        return res.status(201).json({
            message: `${username} invited as ${role}`,
            collaborator,
        });
    }catch(error){
        console.error("InviteCollaborator role:", error);
        return res.status(500).json({ message: "Server error"});
    }
};

// get all collaborators
export const getCollaborator = async (req: AuthRequest, res: Response) => {
    try{
        const { storyId } = req.params;

        const collaborators = await prisma.collaborator.findMany({
            where: { storyId: storyId as string },
            include: {
                user : {
                    select: {
                        id: true,
                        username: true,
                        name: true,
                        avatar: true,
                    },
                },
            },
            orderBy: { createdAt: "asc"},
        });
        return res.status(200).json({ collaborators });
    }catch(error){
        console.error("GetCollaborators error:", error);
        return res.status(500).json({ message: "Server error"});
    }
};

// Update Collaborator

export const updateCollaboratorRole = async( req: AuthRequest, res: Response,) => {
    try{
        const { storyId, collaboratorId} = req.params;
        const userId = req.user!.id;

        const parsed = updateRoleSchema.safeParse(req.body);
        if(!parsed.success){
            return res.status(400).json({
                message: parsed.error.issues[0].message,
            });
        }

        //only author can change role
        const story = await prisma.story.findUnique({
            where: { id: storyId as string},
        });

        if(!story){
            return res.status(404).json({ message: "Story not found."});
        }

        if(story.authorId !== userId){
            return res.status(403).json({
                message: "Only the author can change roles.",
            });
        }

        //find collaborator
        const collaborator = await prisma.collaborator.findUnique({
            where: { id: collaboratorId as string}
        });

        if(!collaborator || collaborator.storyId !== storyId){
            return res.status(404).json({ message: "Collborator not found"});
        }

        // update roles

        const updated = await prisma.collaborator.update({
            where: {id: collaboratorId as string},
            data: { role: parsed.data.role },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        name: true,
                        avatar: true,
                    },
                },
            },
        });

        return res.status(200).json({
            message: "Role updated",
            collaborator: updated,
        });
    } catch(error){
        console.error("UpdateCollaboratorRole error:",error);
        return res.status(500).json({ message: "Server error"});
    }
};

export const removeCollaborator = async (req: AuthRequest, res: Response) => {
    try{
        const { storyId, collaboratorId} = req.params;
        const userId = req.user!.id;

        const story = await prisma.story.findUnique({
            where: { id: storyId as string},
        });

        if(!story){
            return res.status(404).json({message: "Story not found"});
        }

        //find collaborator
        const collaborator = await prisma.collaborator.findUnique({
            where: { id: collaboratorId as string},
        });

        if(!collaborator || collaborator.storyId != storyId){
            return res.status(404).json({ message: "Collaborator not found"});
        }

        const isAuthor = story.authorId === userId;
        const isSelf = collaborator.userId === userId;

        if( !isAuthor && !isSelf){
            return res.status(403).json({
                message: "Not allowed to remove this collaborator",
            });
        }

        await prisma.collaborator.delete({
            where: { id: collaboratorId as string},
        });

        return res.status(200).json({
            message: "Collaborator removeed",
        });
    }catch(error){
        console.error("RemoveCollaborator error:",error);
        return res.status(500).json({ message: "Server error"});
    }
};

// get the stories on which current user has collaborated

export const getMyCollaborations = async (req: AuthRequest, res: Response) => {
    try{
        const userId = req.user!.id;

        const collaborations = await prisma.collaborator.findMany({
            where: { userId },
            include: {
                story: {
                    include: {
                        author: {
                            select: {
                                id: true,
                                username: true,
                                name: true,
                                avatar: true,
                            },
                        },
                        _count: {
                            select: { branches : true},
                        },
                    },
                },
            },
            orderBy: { createdAt: "desc"},
        });

        return res.status(200).json({ collaborations });
    } catch(error){
        console.error("GetMyCollaborations error:",error);
        return res.status(500).json({ message: "Server error."});
    }
};