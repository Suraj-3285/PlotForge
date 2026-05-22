import { Response } from "express";
import { z }  from "zod";
import { AuthRequest } from "../middlewares/auth.middleware";
import prisma from "../config/db";


const exportSchema = z.object({
    format: z.enum(["txt","md"],{
        error: ()=> ({ message: "Format must be txt or md"}),
    }),
});

// build txt to export
const builtTXT = (
    title: string,
    branchName: string,
    author: string,
    commits: { message: string; content: string; createdAt: Date} [],
): string => {
    const header = [
        "=".repeat(60),
        `STORY: ${title}`,
        `BRANCH: ${branchName}`,
        `AUTHOR: ${author}`,
        `EXPORTED: ${new Date().toLocaleDateString()}`,
        "=".repeat(60),
        "",
    ].join("\n");

    const body = commits.map((commit,index) => {
        return [
            `--- Version ${index+1}: ${commit.message}---`,
            `Date: ${new Date(commit.createdAt).toLocaleDateString()}`,
            "",
            commit.content,
            "",
        ].join("\n");
    }).join("\n");
    return header+body;
}

//build md to export

const builtMarkdown = (
    title: string,
    branchName: string,
    author: string,
    commits: { message: string; content: string;createdAt: Date}[],
): string => {
    const header = [
        `# ${title}`,
        "",
        `> **Branch:** ${branchName}`,
        `> **Author:** ${author}`,
        `> **Exported: **${new Date().toLocaleDateString()}`,
        "",
        "---",
        "",
    ].join("\n");

    const body = commits.map((commit,index) => {
        return [
            `## Version ${index+1} - ${commit.message}`,
            "",
            `*${new Date(commit.createdAt).toLocaleDateString()}*`,
            "",
            commit.content,
            "---",
            "",
        ].join("\n");
    }).join("\n");
    return header+body;
};

const buildCompiled = (
    title: string,
    branchName: string,
    author: string,
    latestContent: string,
    format: "txt" | "md",
): string => {
    if(format === "md"){
        return [
            `# ${title}`,
            "",
            `> **Branch:** ${branchName}  `,
            `> **Author:** ${author}  `,
            `> **Exported:** ${new Date().toLocaleDateString()}`,
            "",
            "---",
            "",
            latestContent,
        ].join("\n");
    }

    return [
        "=".repeat(60),
        `STORY: ${title}`,
        `BRANCH: ${branchName}`,
        `AUTHOR: ${author}`,
        `EXPORTED: ${new Date().toLocaleDateString()}`,
        "=".repeat(60),
        "",
        latestContent,
    ].join("\n");
};

// export full branch - all commits
export const exportBranch = async (req: AuthRequest, res: Response) => {
    try{
        const { storyId,branchId } = req.params;
        const parsed = exportSchema.safeParse(req.query);
        if(!parsed.success){
            return res.status(400).json({
                message: parsed.error.issues[0].message,
            });
        }

        const { format } = parsed.data;
        const story = await prisma.story.findUnique({
            where: {id: storyId as string},
            include: {
                author: {
                    select: {username: true},
                },
            },
        });

        if(!story){
            return res.status(404).json({ message: "Story not found"});
        }
        const isAuthor = story.authorId === req.user!.id;
        const isCollaborator = await prisma.collaborator.findUnique({
            where: {
                storyId_userId: {
                    storyId: storyId as string,
                    userId : req.user!.id,
                },
            },
        });

        if(!isAuthor && !isCollaborator){
            return res.status(403).json({ message: "Access denied"});
        }

        const branch = await prisma.branch.findFirst({
            where: { id: branchId as string, storyId: storyId as string},
        });

        if(!branch){
            return res.status(404).json({ message: "Branch not found"});
        }

        const commits = await prisma.commit.findMany({
            where: { branchId: branchId as string},
            orderBy: { createdAt: "asc"},
            select: {
                message: true,
                content : true,
                createdAt : true,            
            },
        });
        if(commits.length === 0){
            return res.status(400).json({
                message: "No content to export.",
            });
        }

        // build file content
        const content = format === "txt" 
                        ? builtTXT(story.title, branch.name, story.author.username, commits)
                        : builtMarkdown(story.title,branch.name,story.author.username,commits,);
        //set download headers
        const filename = `${story.title.replace(/\s+/g,"-")}-${branch.name}.${format}`;

        const mimeType = format === "txt" ? "text/plain" : "text/markdown";

        res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
        res.setHeader("Content-Type", mimeType);
        return res.status(200).send(content);
    }catch(error){
        console.error("ExportBranch Error",error);
        return res.status(500).json({ message: "Server error"});
    }
};

export const exportCompiled = async (req:AuthRequest,res:Response) => {
    try{
        const { storyId, branchId } = req.params;
        const parsed = exportSchema.safeParse(req.query);
        if(!parsed.success){
            return res.status(400).json({
                message: parsed.error.issues[0].message,
            });
        }

        const { format } = parsed.data;

        const story = await prisma.story.findUnique({
            where: { id: storyId as string},
            include: {
                author: { select : { username: true}},
            },
        });

        if(!story){
            return res.status(404).json({ message: "Story not found"});
        }

        const isAuthor = story.authorId === req.user!.id;
        const isCollaborator = await prisma.collaborator.findUnique({
            where: {
                storyId_userId: {
                    storyId: storyId as string,
                    userId: req.user!.id,
                },
            },
        });

        if(!isAuthor && !isCollaborator){
            return res.status(403).json({ message:"Access denied."});
        }

        const branch = await prisma.branch.findFirst({
            where : { id: branchId as string,storyId: storyId as string},
        });

        if(!branch){
            return res.status(404).json({ message: "Branch not found."});
        }

        const latestCommit = await prisma.commit.findFirst({
            where: {branchId: branchId as string},
            orderBy: {createdAt: "desc"},
            select: { content : true},
        });

        if(!latestCommit){
            return res.status(400).json({ message: " No content to export."});
        }

        const content = buildCompiled(story.title,branch.name,story.author.username,latestCommit.content,format,);

        const filename = `${story.title.replace(/\s+/g,"-")}-${branch.name}-final.${format}`;
        const mimeType = format === "txt"? "text/plain":"text/markdown";

        res.setHeader("Content-Type", mimeType);
        res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
        return res.send(content);
    }catch(error){
        console.error("ExportCompiler Error",error);
        return res.status(500).json({ message: "Server Error"});
    }
};