import { Response } from "express";
import { z }  from 'zod';
import { AuthRequest } from "../middlewares/auth.middleware";
import prisma from "../config/db";

//validation

const createCommitSchema = z.object({
    message: z.string().min(1,'Commit message is required').max(200, 'Commit message too long'),
    content: z.string().min(1, 'Content cannot be empty'),
});

// helper
const countWords = (text: string): number => {
    return text.trim().split(/\s+/).filter(Boolean).length;
};

// create commit

export const createCommit = async (req: AuthRequest, res: Response) => {
    try {
        const { storyId, branchId } = req.params;

        //validate

        const parsed = createCommitSchema.safeParse(req.body);
        if(!parsed.success){
            return res.status(400).json({
                message: parsed.error.issues[0].message
            });
        }

        const { message, content } = parsed.data;

        //check if branch exist and belong to story

        const branch = await prisma.branch.findFirst({
            where: {id: branchId as string, storyId: storyId as string},
            include: {
                commits: {
                    orderBy: { createdAt: 'desc'},
                    take: 1,
                }
            }
        });

        if(!branch){
            return res.status(404).json({ message: 'Branch not found.'});
        }

        const parentCommit = branch.commits[0] || null;
        const wordCount = countWords(content);

        // create commit
        const commit = await prisma.commit.create({
            data: {message,content,wordCount,branchId: branchId as string,authorId: req.user!.id,parentId: parentCommit?.id || null,},
            include: { author: { select: {id:true, username: true, avatar: true,}}, parent: { select: {id: true, message: true,}}}
        });

        //update latestCommitId of branch
        await prisma.branch.update({
            where: { id: branchId as string},
            data: { latestCommitId: commit.id,}
        });

        //update word count

        await prisma.story.update({
            where: { id: storyId as string},
            data: { wordCount},
        });

        return res.status(201).json({
            message: 'Commit saved.',commit,
        });
    }catch(error){
        console.error('CreateCommit error:',error);
        return res.status(500).json({ message: 'Server error.'});
    }
};

// get all commits on current branch

export const getCommits = async (req: AuthRequest, res: Response) => {
    try{
        const { storyId,branchId } = req.params;

        const branch = await prisma.branch.findFirst({
            where: { id: branchId as string, storyId: storyId as string},
        });

        if(!branch){
            return res.status(404).json({ message: "Branch not found"});
        }

        const commits = await prisma.commit.findMany({
            where: { branchId: branchId as string},
            include: {
                author: { select : { id: true, username: true, avatar: true,},},
            },
            orderBy: { createdAt: 'desc'},
        });
        return res.status(200).json({ commits });
    } catch(error){
        console.error("GetCommits error:",error);
        return res.status(500).json({ message: "Server error"});
    }
};

// get single commit

export const getCommit = async (req: AuthRequest, res: Response) => {
    try{
        const { commitId } = req.params;

        const commit = await prisma.commit.findUnique({
            where: {id: commitId as string},
            include: {author: {select: {id: true, username: true, avatar: true,},},parent: { select: { id: true,message: true, createdAt: true,},}, children: { select: { id: true, message: true, createdAt: true,},}, branch: { select: {id: true, name: true, storyId: true,},},},
        });

        if(!commit){
            return res.status(404).json({ message: "Commit not found."});
        }

        return res.status(200).json({ commit });
    } catch(error) {
        console.error("GetCommit error:", error);
        return res.status(500).json({ message: "Server error."});
    }
};

//get latest commit of branch on editor

export const getLatestCommit = async (req: AuthRequest, res: Response) => {
    try{
        const { storyId, branchId } = req.params;
        const branch = await prisma.branch.findFirst({
            where: {id: branchId as string, storyId: storyId as string},
        });

        if(!branch){
            return res.status(404).json({ message: "Branch not found."});
        }

        const commit = await prisma.commit.findFirst({
            where: { branchId: branchId as string},
            orderBy: {createdAt: "desc"},
            include: { author: { select: { id: true, username: true, avatar: true,},},},
        });

        return res.status(200).json({ commit });
    }catch(error){
        console.error("GetLatestCommit error:", error);
        return res.status(500).json({ message: "Server error"});
    }
};
