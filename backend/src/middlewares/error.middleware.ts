import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', err.message);

  return res.status(500).json({
    message: err.message || 'Something went wrong on the server.',
  });
};