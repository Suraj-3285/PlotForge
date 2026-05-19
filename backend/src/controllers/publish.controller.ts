import { Response } from "express";
import { z } from "zod";
import { AuthRequest } from "../middlewares/auth.middleware";
import prisma from "../config/db";

const publishSchema = z.object({
    branchId: z.string().uuid("Invalid branch ID"),
});

export const publishBranch = async (req: AuthRequest, res: Response) => {
    try{
        const { storyId } = req.params;
        const userId = req.user!.id;

        const parsed = publishSchema.safeParse(req.body);
        if(!parsed.success){
            return res.status(400).json({
                message: parsed.error.issues[0].message,
            });
        }

        const { branchId } = parsed.data;

        const story = await prisma.story.findUnique({
            where: {id: storyId as string},
        });

        if(!story){
            return res.status(404).json({ message: "Story not found"});
        }

        if(story.authorId !== userId){
            return res.status(403).json({
                message: "Only the author can publish endings",
            });
        }

        const branch = await prisma.branch.findFirst({
            where: { id: branchId, storyId: storyId as string},
            include: {
                commits: {
                    orderBy: { createdAt: "desc"},
                    take: 1,
                },
            },
        });
        if(!branch){
            return res.status(404).json({ message: "Branch not found"});
        }

        //must have at least one commit for publishing
        const latestCommit = branch.commits[0];
        if(!latestCommit){
            return res.status(400).json({
                message: "Branch has no content to publish",
            });
        }

        //check if already published
        const existingPublish = await prisma.publishing.findFirst({
            where: { branchId, isActive: true},
        });

        if(existingPublish){
            return res.status(400).json({
                message: "This branch is already published",
            });
        }

        //publish in transaction
        const published  = await prisma.$transaction(async (tx) => {
            const publishing = await tx.publishing.create({
                data: {
                    branchId, finalContent: latestCommit.content,
                },
                include: {
                    branch: {
                        select: {
                            id: true,
                            name: true,
                            storyId: true,
                        },
                    },
                },
            });

            await tx.story.update({
                where: { id:storyId as string},
                data: { isPublished: true},
            });
            return publishing;
        });

        return res.status(201).json({
            message: "Branch published as ending",
            publishing: published,
        });
    }catch(error){
        console.error("PublishBranch error:",error);
        return res.status(500).json({ message: "Server error"});
    }
};

//Unpublish a branch
export const unpublishBranch = async(req: AuthRequest, res: Response) => {
    try{
        const { storyId,publishingId } = req.params;
        const userId = req.user!.id;

        const story = await prisma.story.findUnique({
            where: {id: storyId as string},
        });

        if(!story){
            return res.status(404).json({ message: "Story not found"});
        }
        if(story.authorId !== userId){
            return res.status(403).json({
                message: "Only the author can publish",
            });
        }

        //find publishing record
        const publishing = await prisma.publishing.findUnique({
            where: {id: publishingId as string},
        });
        if(!publishing){
            return res.status(404).json({ message: "Published ending not found"});
        }
        //Deactivate
        await prisma.publishing.update({
            where: { id: publishingId as string},
            data: { isActive: false},
        });

        //marking story as draft when no active publishings
        const activePublishing = await prisma.publishing.count({
            where: { branch: {storyId: storyId as string}, isActive: true,},
        });

        if(activePublishing == 0){
            await prisma.story.update({
                where: {id: storyId as string},
                data: {isPublished: false},
            });
        }
        return res.status(200).json({ message: "Ending unpublished"});
    }catch(error){
        console.error("UnpublishBranch error",error);
        return res.status(500).json({ message: "Server error"});
    }
};

// getting all published endings of a story

export const getPublishedEndings = async (req: AuthRequest, res: Response) => {
    try{
        const { storyId } = req.params;

        const endings = await prisma.publishing.findMany({
            where: {
                branch: { storyId: storyId as string},
                isActive: true,
            },
            include: {
                branch: {
                    select: {
                        id:true,
                        name: true,
                    },
                },
            },
        });

        //get ratings for each ending
        const endingsWithRatings = await Promise.all(
            endings.map(async (endings) => {
                const ratings = await prisma.rating.findMany({
                    where: {publishingId: endings.id},
                });

                const avgRating = ratings.length > 0 ? ratings.reduce((sum,r) => sum+r.stars,0)/ratings.length:0;

                return {
                    ...endings,
                    avgRating: Math.round(avgRating*10)/10,
                    totalRatings: ratings.length,
                };
            }),
        );

        return res.status(200).json({ endings: endingsWithRatings });
    } catch(error){
        console.error("GetPublishedEndings error:",error);
        return res.status(500).json({ message: "Server error"});
    }
};

//read a published ending

export const readEnding = async (req: AuthRequest, res: Response) => {
    try{
        const { publishingId } = req.params;

        const ending = await prisma.publishing.findUnique({
            where: { id: publishingId as string},
            include: {
                branch: {
                    select: {
                        id: true,
                        name: true,
                        story: {
                            select: {
                                id: true,
                                title: true,
                                description: true,
                                coverImage: true,
                                genre : true,
                                tags: true,
                                author: {
                                    select: {
                                        id: true,
                                        username: true,
                                        name: true,
                                        avatar: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

        if(!ending || !ending.isActive){
            return res.status(404).json({ message: "Ending not found."});
        }

        //get ratings
        const ratings = await prisma.rating.findMany({
            where: { publishingId: publishingId as string},
        });

        const avgRating = ratings.length > 0 ? ratings.reduce((sum,r) => sum+ r.stars,0)/ ratings.length:0;

        //check if current user has rated
        let userRating = null;
        if(req.user){
            const myRating = await prisma.rating.findUnique({
                where: {
                    publishingId_userId: {
                        publishingId: publishingId as string,
                        userId: req.user.id,
                    },
                },
            });
            userRating = myRating?.stars || null;
        }

        return res.status(200).json({
            ending: {
                ...ending,
                avgRating: Math.round(avgRating*10)/10,
                totalRatings: ratings.length,
                userRating,
            },
        });
    }catch(error){
        console.error("ReadEndings error:",error);
        return res.status(500).json({ message: "Server error."});
    }
};