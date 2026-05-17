import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import prisma from '../config/db';

//validation schemas

const registerSchema = z.object({
    email: z.string().email('Invalid email'),
    username: z.string()
    .min(3,'Username must be at least 3 characters')
    .max(20,'Username must be at most 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers and underscores'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    name: z.string().optional(),
});

const loginSchema = z.object({
    email: z.string().email('Invalid email'),
    password: z.string().min(1,'Password is required'),
});

// helper to generate jwt

const generateToken = (id: string) => {
    return jwt.sign(
        { id },
        process.env.JWT_SECRET as string,
        { expiresIn: '7d'}
    );
};

//registerSchema

export const register = async (req: Request, res: Response) => {
    try {
        //validating input
        const parsed = registerSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                message: parsed.error.issues[0].message
            });
        }

        const { email, username, password, name} = parsed.data;

        //email already exist or not 
        const emailExists = await prisma.user.findUnique({
            where: {email}
        });
        if (emailExists) {
            return res.status(400).json({
                message: 'Email already in use.'
            });
        }

        //username already exist 
        const usernameExists = await prisma.user.findUnique({
            where: {username}
        });
        if (usernameExists) {
            return res.status(400).json({
                message: 'Username already taken.'
            });
        }

        //hash password
        const salt  = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password,salt);

        //create user

        const user = await prisma.user.create({
            data: {
                email,
                username,
                password : hashedPassword,
                name: name || username,
            },

            select: {
                id: true,
                email: true,
                username: true,
                name: true,
                bio: true,
                avatar: true,
                createdAt: true,
            }
        });

        //generate token
        const token = generateToken(user.id);

        return res.status(201).json({
            message: 'Account created successfully.',
            token,
            user,
        });
    } catch (error) {
        console.error('Register error:',error);
        return res.status(500).json({ message: 'Server error.'});
    }
};

// login

export const login = async (req: Request, res: Response) => {
    try {
        //validate input
        const parsed = loginSchema.safeParse(req.body);
        if(!parsed.success) {
            return res.status(400).json({
                message: parsed.error.issues[0].message
            });
        }

        const { email,password } = parsed.data;

        // finding user in DB 
        const user  = await prisma.user.findUnique({
            where: {email}
        });
        if(!user) {
            return res.status(401).json({
                message: 'Invalid email or password.'
            });
        }

        //checking password
        const isMatch = await bcrypt.compare(password,user.password);
        if(!isMatch){
            return res.status(401).json({
                message: 'Invalid email or password.'
            });
        }

        //generate token

        const token = generateToken(user.id);
        return res.status(200).json({
            message: 'Login successful.',
            token,
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                name: user.name,
                bio: user.bio,
                avatar: user.avatar,
                createdAt: user.createdAt,
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({message: 'Server error.'});
    }
};

// get current user

export const getMe = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;

        const user = await prisma.user.findUnique({
            where: {id: userId },
            select: {
                id: true,
                email: true,
                username: true,
                name: true,
                bio: true,
                avatar: true,
                createdAt: true,
            }
        });

        return res.status(200).json({ user });
    } catch (error) {
        console.error('GetMe error:',error);
        return res.status(500).json({ message: 'Server error.'});
    }
};
