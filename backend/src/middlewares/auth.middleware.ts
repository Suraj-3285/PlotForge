import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../config/db';

export interface AuthRequest extends Request {
    user?: {
        id: string;
        email: string;
        username: string;
    };
}

export const protect = async (
    req: AuthRequest,
    res : Response,
    next : NextFunction
) => {
    try{
        const authHeader = req.headers.authorization;
        if(!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                message: 'Not authorized. No token provided'
            });
        }

        const token  = authHeader.split(' ')[1];

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET!
        ) as {id: string};

        const user = await prisma.user.findUnique({
            where: {id: decoded.id},
            select: {id: true, email: true, username: true}
        });

        if (!user) {
            return res.status(401).json({
                message: 'Not authorized. User not found.'
            });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({
            message: 'Not authorized. Invalid token.'
        });
    }
};