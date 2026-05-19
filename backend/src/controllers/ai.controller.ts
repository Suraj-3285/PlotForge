import { Response } from 'express';
import { z } from 'zod';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { AuthRequest } from '../middlewares/auth.middleware';
import prisma from '../config/db';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash-lite",
});

const aiRequestSchema = z.object({
    content: z.string().min(1,"Content is required"),
    genre: z.string().optional(),
});

//helper
const buildContext = (content: string,genre?: string): string => {
    return `You are a creative writing assistant for PlotForge, a collaborative storytelling platform.${genre ? `The story genre is ${genre}.`:""}
    Here is the current story content:
    """
    ${content}
    """`;
};

//suggest next part

export const suggestNext = async (req: AuthRequest, res: Response) => {
    try{
        const parsed = aiRequestSchema.safeParse(req.body);
        if(!parsed.success){
            return res.status(400).json({
                message: parsed.error.issues[0].message,
            });
        }

        const { content,genre } = parsed.data;

        res.setHeader("Content-Type","text/event-stream");
        res.setHeader("Cache-Control","no-cache");
        res.setHeader("Connection","keep-alive");

        if((res as any).flushHeaders){
            (res as any).flushHeaders();
        }

        const prompt = `${buildContext(content,genre)}
            Continue this story naturally.
            Write the next 2-3 paragraphs.
            Only return the continuation.`;
        const result = await model.generateContentStream(prompt);

        for await(const chunk of result.stream){
            const text = chunk.text();
            if(text){
                res.write(`data: ${JSON.stringify({text})}\n\n`);
            }
        }
        res.write(`data: [DONE]\n\n`);
        res.end();
    }catch(error: any){
        console.error("SuggestNext error:",error);

        res.write(
            `data: ${JSON.stringify({
                error: error?.message || "AI error occurred.",
            })}\n\n`,
        );
        res.end();
    }
};

//suggest twist
export const suggestTwist = async (req: AuthRequest, res: Response) => {
    try{
        const parsed = aiRequestSchema.safeParse(req.body);
        if(!parsed.success){
            return res.status(400).json({
                message: parsed.error.issues[0].message,
            });
        }
        const { content, genre} = parsed.data;

        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");

        if((res as any).flushHeaders){
            (res as any).flushHeaders();
        }

        const prompt = `${buildContext(content,genre)}
            Suggest 3 unexpected but believable plot twists.

            Format:
            Twist 1:
            Twist 2:
            Twist 3:
        `;

        const result = await model.generateContentStream(prompt);

        for await (const chunk of result.stream){
            const text = chunk.text();

            if(text){
                res.write(`data: ${JSON.stringify({ text })}\n\n`);
            }
        }

        res.write(`data: [DONE]\n\n`);
        res.end();
    } catch(error: any){
        console.error("SuggestTwist error:",error);

        res.write(
            `data: ${JSON.stringify({
                error: error?.message || "AI error ocurred.",
            })}\n\n`,
        );

        res.end();
    }

};

    // improve writing
    export const improveWriting = async (req: AuthRequest, res: Response) => {
        try{
            const parsed = aiRequestSchema.safeParse(req.body);
            if(!parsed.success){
                return res.status(400).json({
                    message: parsed.error.issues[0].message,
                });
            }
            const { content } = parsed.data;

            res.setHeader("Content-Type","text/event-stream");
            res.setHeader("Cache-Control","no-cache");
            res.setHeader("Connection","keep-alive");

            if((res as any).flushHeaders){
                (res as any).flushHeaders();
            }

            const prompt = `Improve the writing quality of this text. Keep same meaning and plot.
            
            Text:
            """
            ${content}
            """`;

            const result = await model.generateContentStream(prompt);

            for await (const chunk of result.stream){
                const text = chunk.text();

                if(text){
                    res.write(`data: ${JSON.stringify({ text })}\n\n`);
                }
            }
            res.write(`data: [DONE]\n\n`);
            res.end();
        } catch(error: any){
            console.error("ImproveWriting error:",error);
            res.write(`data: ${JSON.stringify({
                error: error?.message || "AI error ocurred.",
            })}\n\n`,);
            res.end();
        }
    };

    // fix grammar

    export const fixGrammar = async (req: AuthRequest, res: Response) => {
        try{
            const parsed = aiRequestSchema.safeParse(req.body);
            if(!parsed.success){
                return res.status(400).json({
                    message: parsed.error.issues[0].message,
                });
            }
            const { content } = parsed.data;
            const prompt = `Fix grammar and spelling mistakes only.
            
            Text:
            """
            ${content}
            """`;

            const result = await model.generateContent(prompt);
            const fixed = result.response.text();

            return res.status(200).json({ fixed });
        } catch(error: any){
            console.error("FixGrammar error:",error);
            return res.status(500).json({
                message: "AI error occurred.",
                error: error?.message || error,
                details: error?.errorDetails || null,
                status : error?.status || null,
            });
        }
    };

// generate summary

export const generateSummary = async (req: AuthRequest, res: Response) => {
    try{
        const { branchId } = req.params;

        const commits = await prisma.commit.findMany({
            where: {
                branchId: branchId as string,
            },
            orderBy: {
                createdAt: "asc",
            },
            select: {
                content: true,
            },
        });

        if(commits.length === 0){
            return res.status(400).json({
                message: "No content to summarise",
            });
        }
        const fullContent = commits.map((c) => c.content).join("\n\n");

        const truncated = fullContent.length > 8000? fullContent.substring(0,8000)+ "...":fullContent;

        const prompt = `Write a concise summary of this story.
        Story:
        """
        ${truncated}
        """`;

        const result = await model.generateContent(prompt);
        const summary = result.response.text();
        return res.status(200).json({ summary });
    } catch(error: any) {
        console.error("GenerateSummary error:",error);
        return res.status(500).json({
            message: "AI error occurred.",
            error: error?.message || error,
            details: error?.errorDetails || null,
            status: error?.status || null,
        });
    }
};
