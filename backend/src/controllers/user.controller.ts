import { Response } from "express";
import { z } from "zod";
import { AuthRequest } from "../middlewares/auth.middleware";
import prisma from "../config/db";
import cloudinary from "../config/cloudinary";

//validation

const updateProfileSchema = z.object({
    name: z.string().min(1).max(50).optional(),
    bio: z.string().max(200).optional(),
    username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/,'Username can only contain letters, numbers and underscores').optional(),
})

//get profile 

export const getMyProfile = async (req: AuthRequest, res: Response) => {
    try{
        const user = await prisma.user.findUnique({
            where: {id: req.user!.id },
            select: {id: true, email: true, username: true,name: true,bio: true,avatar: true,createdAt: true,_count: { select:{stories:true, collaborations: true,}}}
        });

        if(!user) {
            return res.status(404).json({message: 'User not found.'});
        }

        return res.status(200).json({user});
    } catch (error) {
        console.error('GetMyProfile error:',error);
        return res.status(500).json({message: 'Server error.'});
    }
};

//get public profile

export const getPublicProfile = async (req: AuthRequest, res: Response) => {
    try{
        const { username } = req.params as { username: string };

        const user = await prisma.user.findUnique({
            where: { username },
            select: {
                id: true, username: true, name: true, bio: true, avatar: true,createdAt: true,stories: {
                    where: {isPublished: true},
                    select: {id: true, title: true,description: true, coverImage: true,genre: true,tags: true,createdAt: true},orderBy: { createdAt: 'desc' }
                }, _count : {
                    select: { stories: true, collaborations: true,}
                }
            }
        });

        if(!user){
            return res.status(404).json({message: 'User not found.'});
        }

        return res.status(200).json({ user });
    } catch(error){
        console.error('GetPublicProfile error:',error);
        return res.status(500).json({message: 'Server error.'});
    }
};

// update profile

export const updateProfile = async (req: AuthRequest, res: Response) => {
    try{
        const parsed = updateProfileSchema.safeParse(req.body);
        if(!parsed.success) {
            return res.status(400).json({
                message: parsed.error.issues[0].message
            });
        }

        const { name,bio,username} = parsed.data;

        //checking if username already exists
        if(username){
            const existing = await prisma.user.findUnique({
                where: { username }
            });
            if(existing && existing.id !== req.user!.id){
                return res.status(400).json({
                    message: 'Username already taken.'
                });
            }
        }

        //update user
        const updated = await prisma.user.update({
            where: {id: req.user!.id},
            data: {
                ...(name && { name }),
                ...(bio && { bio }),
                ...(username && { username }),
            },
            select: {
                id: true,email: true,username: true,name: true,bio: true,avatar: true,createdAt: true,
            }
        });

        return res.status(200).json({
            message: 'Profile updated.',
            user: updated
        });
    } catch(error){
        console.error('UpdateProfile error:',error);
        return res.status(500).json({message: 'Server error.'});
    }
};

// Upload avatar

export const uploadAvatar = async (req: AuthRequest, res: Response) => {
    try{
        if(!req.file){
            return res.status(400).json({ message: 'No image provided.'});
        }

        const imageUrl = (req.file as any).path;

        const currentUser = await prisma.user.findUnique({
            where: { id: req.user!.id },
            select: { avatar: true}
        });

        if(currentUser?.avatar){
            const publicId = currentUser.avatar.split('/').pop()?.split('.')[0];
            if(publicId){
                await cloudinary.uploader.destroy(`plotforge/avatars/${publicId}`);
            }
        }

        // save new avatar url 
        const updated = await prisma.user.update({
            where: {id: req.user!.id},
            data: { avatar: imageUrl },
            select: {id: true,email: true,username: true,name: true,bio: true,avatar: true,}
        });

        return res.status(200).json({
            message: 'Avatar uploaded.',
            user: updated
        });
    } catch(error){
        console.error('UploadAvatar error:',error);
        return res.status(500).json({message: 'Server error.'});
    }   
};