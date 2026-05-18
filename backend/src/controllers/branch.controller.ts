import { Response } from "express";
import { z } from 'zod';
import { AuthRequest } from "../middlewares/auth.middleware";
import prisma from "../config/db";
//validation

const createBranchSchema = z.object({
    name: z.string().min(1,'Branch name is required').max(50).regex(/^[a-zA-Z0-9-_]+$/,'Branch name can only contain letters, numbers,hyphens and underscores. '),
    fromCommitId: z.string().uuid('Invalid commit ID').optional(),
});

// create branch

export const createBranch = async (req: AuthRequest, res: Response) => {
    try{
        const { storyId } = req.params as {storyId : string};

        // validate
        const parsed = createBranchSchema.safeParse(req.body);
        if(!parsed.success){
            return res.status(400).json({
                message: parsed.error.issues[0].message
            });
        }

        const { name, fromCommitId} = parsed.data;

        //check story exists
        const story = await prisma.story.findUnique({
            where: { id : storyId}
        });

        if(!story){
            return res.status(404).json({ message : 'Story not found.'});
        }

        //checking branch name not already taken in current story
        const existingBranch = await prisma.branch.findFirst({
            where: {storyId, name}
        });

        if(existingBranch){
            return res.status(400).json({
                message: 'A branch with this name already exists.'
            });
        }

        //check commitId is of current story
        if(fromCommitId){
            const commit = await prisma.commit.findFirst({
                where: { id: fromCommitId, branch: { storyId } }
            });

            if(!commit){
                return res.status(404).json({ message: 'Commit not found.'});
            }
        }

        // create branch
        const branch = await prisma.branch.create({
            data: { name,storyId,
                //If branching from a commit copy its content as the first  commit 
                ...(fromCommitId && {
                    commits: { create: { message: `Branched from commit.`,content: await getCommitContent(fromCommitId),authorId: req.user!.id, parentId: fromCommitId,}}
                })
            },
            include: {
                commits: true,
            }
        });

        return res.status(201).json({
            message: 'Branch created.',
            branch,
        });
    } catch(error){
        console.error('CreateBranch error:',error);
        return res.status(500).json({ message: 'Server error.'});
    }
};

const getCommitContent = async (commitId: string): Promise<string> => {
    const commit = await prisma.commit.findUnique({
        where: {id: commitId},
        select: {content: true}
    });
    return commit?.content || '';
};

//get all branched of story

export const getBranches = async (req: AuthRequest, res: Response) => {
    try{
        const { storyId } = req.params as {storyId : string};

        const branches = await prisma.branch.findMany({
            where: { storyId },
            include: {_count: {select: {commits: true }}, commits: { orderBy : {createdAt: 'desc'}, take: 1, select: { id: true, message: true, createdAt: true, author: {select: {username: true, avatar: true,}}}}},
            orderBy : { createdAt: 'asc'}
        });

        return res.status(200).json({ branches });
    } catch (error) {
        console.error('GetBranches error:',error);
        return res.status(500).json({ message: 'Server error.'});
    }
};

// get single branch

export const getBranch = async (req: AuthRequest, res: Response) => {
    try {
        const storyId = req.params.storyId as string;
        const branchId = req.params.branchId as string;

        const branch = await prisma.branch.findFirst({
            where: { id: branchId,storyId },
            include: { commits: { orderBy: { createdAt: 'desc' }, include: {author: {select: {id: true,username: true, avatar: true,}}}},_count: { select: { commits: true }}}
        });

        if(!branch){
            return res.status(404).json({ message: 'Branch not found.' });
        }
        return res.status(200).json({ branch });
    } catch(error){
        console.error('GetBranch error:',error);
        return res.status(500).json({ message: 'Server error.'});
    }
};

// get branch tree

export const getBranchTree = async (req: AuthRequest, res: Response) => {
    try{
        const { storyId } = req.params as {storyId : string};

        const branches = await prisma.branch.findMany({
            where: { storyId },
            include: {
                commits: {
                    orderBy: { createdAt: 'asc'},
                    select: {
                        id: true,
                        message: true,
                        parentId: true,
                        createdAt: true,
                        wordCount: true,
                        author: {
                            select: {
                                username: true,
                                avatar: true,
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'asc'}
        });

        //shaping data for tree

        const tree = branches.map(branch => ({
            id: branch.id,
            name: branch.name,
            isDefault: branch.isDefault,
            createdAt : branch.createdAt,
            commits: branch.commits.map(commit => ({
                id: commit.id,
                message: commit.message,
                parentId : commit.parentId,
                createdAt : commit.createdAt,
                wordCount: commit.wordCount,
                author: commit.author,
            }))
        }));

        return res.status(200).json({ tree });
    } catch(error){
        console.error('GetBranchTree error:',error);
        return res.status(500).json({ message: 'Server error.'});
    }
};

export const deleteBranch = async (req: AuthRequest, res: Response) => {
    try{
        const storyId = req.params.storyId as string;
        const branchId = req.params.branchId as string;

        const branch = await prisma.branch.findFirst({
            where: { id: branchId, storyId}
        });

        if(!branch){
            return res.status(404).json({ message: 'Branch not found.'});
        }

        if(branch.isDefault){
            return res.status(400).json({
                message: 'Cannot delete the main branch.'
            });
        }

        await prisma.branch.delete({
            where: {id: branchId}
        });

        return res.status(200).json({ message: 'Branch deleted.'});
    }catch(error){
        console.error('DeleteBranch error:', error);
        return res.status(500).json({ message: 'Server error.'});
    }
};

