import { Response } from "express";
import { z } from "zod";
import { AuthRequest } from "../middlewares/auth.middleware";
import prisma from "../config/db";

const ratingSchema = z.object({
    stars: z.number().min(1,"Minimum rating is 1").max(5,"Maximum rating is 5").int("Rating must be a whole no"),
});

//rating a ending

export const rateEnding = async(req: AuthRequest, res: Response) => {
    try{
        const { publishingId } = req.params;
        const userId = req.user!.id;

        const parsed = ratingSchema.safeParse(req.body);
        if(!parsed.success){
            return res.status(400).json({
                message: parsed.error.issues[0].message,
            });
        }
        const { stars } = parsed.data;
        //check ending exist and is isActive or not
        const ending = await prisma.publishing.findUnique({
            where: { id: publishingId as string},
            include: {
                branch: {
                    select: {
                        story: {
                            select: {
                                authorId: true,
                            },
                        },
                    },
                },
            },
        });

        if(!ending || !ending.isActive){
            return res.status(404).json({ message : "Ending not found"});
        }

        //user cant rate their own story
        const storyAuthorId = ending.branch.story.authorId;
        if(storyAuthorId === userId){
            return res.status(400).json({
                message: "You cannot rate your own story",
            });
        }
        //update if rated if not then create
        const rating = await prisma.rating.upsert({
            where: {
                publishingId_userId: {
                    publishingId: publishingId as string,
                    userId,
                },
            },
            update: { stars },
            create: {
                publishingId: publishingId as string,
                userId,stars,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        avatar: true,
                    },
                },
            },
        });

        //get updated average
        const allRatings = await prisma.rating.findMany({
            where: { publishingId : publishingId as string},
        });

        const avgRating = allRatings.reduce((sum,r) => sum+r.stars,0)/ allRatings.length;

        return res.status(200).json({
            message: "Rating saved",
            rating,
            avgRating: Math.round(avgRating*10)/10,
            totalRatings: allRatings.length,
        });
    }catch(error){
        console.log("RateEnding Error",error);
        return res.status(500).json({ message: "Server Error"});
    }
};

//delete rating
export const deleteRating = async (req: AuthRequest, res: Response) => {
    try{
        const { publishingId } = req.params;
        const userId = req.user!.id;

        //find rating
        const rating = await prisma.rating.findUnique({
            where: {
                publishingId_userId: {
                    publishingId: publishingId as string,
                    userId,
                },
            },
        });

        if(!rating){
            return res.status(404).json({ message: "Rating not found."});
        }
        //delete
        await prisma.rating.delete({
            where:{
                publishingId_userId: {
                    publishingId: publishingId as string,userId,
                },
            },
        });

        //get update average
        const allRatings = await prisma.rating.findMany({
            where: { publishingId: publishingId as string},
        });
        const avgRating = allRatings.length > 0 ? allRatings.reduce((sum,r) => sum+r.stars,0)/ allRatings.length : 0;

        return res.status(200).json({
            message: "Rating removed",
            avgRating: Math.round(avgRating*10)/10,
            totalRatings: allRatings.length,
        });
    }catch(error){
        console.error("DeleteRating error:",error);
        return res.status(500).json({ message: "server error"});
    }
};

//get all ratings for an ending
export const getEndingRatings = async (req: AuthRequest, res: Response) => {
    try{
        const { publishingId } = req.params;
        const ratings = await prisma.rating.findMany({
            where: {
                publishingId: publishingId as string,
            },
            include: {
                user: {
                    select : {
                        id: true,
                        username: true,
                        avatar: true,
                    },
                },
            },
            orderBy: { createdAt : "desc"},
        });

        const avgRating = ratings.length>0 ? ratings.reduce((sum,r) => sum+r.stars,0)/ ratings.length: 0;

        //stars breakdown 1-5
        const breakdown = [1,2,3,4,5].map((star) => ({
            star,count: ratings.filter((r) => r.stars === star).length,
        }));

        return res.status(200).json({
            ratings,avgRating: Math.round(avgRating*10)/10,totalRatings: ratings.length, breakdown,
        });
    } catch(error){
        console.error("GetEndingRating error:",error);
        return res.status(500).json({ message: "Server error"});
    }
};

// get my rating for ending
export const getMyRating = async(req:AuthRequest, res: Response) => {
    try{
        const { publishingId } =req.params;
        const userId = req.user!.id;

        const rating = await prisma.rating.findUnique({
            where: {
                publishingId_userId: {
                    publishingId: publishingId as string,
                    userId,
                },
            },
        });
        return res.status(200).json({
            rating: rating?.stars || null,
        });
    }catch(error){
        console.error("GetMyRating error:",error);
        return res.status(500).json({ message: "Server error"});
    }
}
