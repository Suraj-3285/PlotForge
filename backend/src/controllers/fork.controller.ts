import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import prisma from '../config/db';

export const forkStory = async (req: AuthRequest, res: Response) => {
    try {
        const { storyId} = req.params;
        const userId = req.user!.id;

        //finding original story
        const original = await prisma.story.findUnique({
            where: { id: storyId as string},
            include: { branches : { where: { isDefault: true}, include: {commits: { orderBy: { createdAt: "desc"}, take: 1,},},},},
        });

        if(!original){
            return res.status(404).json({ message: "Story not found"});
        }

        //Must be published for forking
        if(!original.isPublished){
            return res.status(403).json({
                message: "You can only fork published stories",
            });
        }

        //cannot fork your own story
        if(original.authorId == userId){
            return res.status(400).json({
                message: "You cannot fork your own story.",
            });
        }

        // check if already forked

        const alreadyForked = await prisma.fork.findUnique({
            where: {
                sourceStoryId_forkedById: {
                    sourceStoryId: storyId as string,
                    forkedById: userId,
                },
            },
        });

        if( alreadyForked ){
            return res.status(400).json({
                message: "You have already forked this story.",
            });
        }

        //get content from latest commit to default branch
        const defaultBranch = original.branches[0];
        const latestCommit = defaultBranch?.commits[0];

        const forkedStory = await prisma.$transaction(async (tx) => {
            const newStory = await tx.story.create({
                data: {
                    title: `${original.title} (Fork)`,
                    description: original.description,
                    coverImage: original.coverImage,
                    genre: original.genre,
                    tags: original.tags,
                    authorId: userId,
                    forkedFromId: storyId as string,

                    //create default branch
                    branches: {
                        create: {
                            name: "main",
                            isDefault: true,

                            //copy latest commit content if exists
                            ...(latestCommit && {
                                commits: {
                                    create: {
                                        message: "Initial commit - forked from original",
                                        content: latestCommit.content,
                                        wordCount: latestCommit.wordCount,
                                        authorId: userId,
                                    },
                                },
                            }),
                        },
                    },
                },
                include: {
                    branches: {
                        include: {
                            commits: true,
                        },
                    },
                    forkedFrom: {
                        select: {
                            id: true,
                            title : true,
                            author : {
                                select: {
                                    username: true,
                                },
                            },
                        },
                    },
                },
            });

            await tx.fork.create({
                data: {
                    sourceStoryId: storyId as string,
                    forkedById: userId,
                },
            });
            return newStory;
        });

        return res.status(201).json({
            message: "Story forked Successfully",
            story: forkedStory,
        });
    } catch(error){
        console.error("Forked story error",error);
        return res.status(500).json({ message: "Server error"});
    }
};

// get all forks of a story

export const getStoryForks = async (req: AuthRequest, res: Response) => {
    try{
        const { storyId } = req.params;

        const forks = await prisma.fork.findMany({
            where: { sourceStoryId: storyId as string},
            include : {
                forkedBy : {
                    select : {
                        id: true,
                        username: true,
                        name: true,
                        avatar: true,
                    },
                },
            },
            orderBy: { createdAt: "desc"},
        });

        const forkedStories = await prisma.story.findMany({
            where: {
                forkedFromId: storyId as string,
            },
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
                    select: { branches: true},
                },
            },
            orderBy: { createdAt: "desc"},
        });

        return res.status(200).json({
            forkCount: forks.length,
            forks: forkedStories,
        });
    } catch(error){
        console.error("GetStoryForks error",error);
        return res.status(500).json({ message: "Server error"});
    }
};

// get all stories user have forked

export const getMyForks = async (req: AuthRequest, res: Response) => {
    try{
        const userId = req.user!.id;
        const myForkedStories = await prisma.story.findMany({
            where: {
                authorId: userId,
                forkedFromId: { not : null},
            },
            include: {
                forkedFrom: {
                    select: {
                        id: true,
                        title: true,
                        author: {
                            select: {
                                username: true,
                                avatar: true,
                            },
                        },
                    },
                },
                branches: {
                    select: {
                        id: true,
                        name: true,
                        isDefault: true,
                    },
                },
                _count: {
                    select: { branches: true},
                },
            },
            orderBy: { createdAt: "desc"},
        });

        return res.status(200).json({ forks: myForkedStories });
    } catch(error){
        console.error("GetMyForks error:",error);
        return res.status(500).json({ message: "Server error."});
    }
};