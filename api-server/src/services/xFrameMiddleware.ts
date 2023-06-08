/* Autor: Alexander Schellenberg */
import { Request, Response, NextFunction } from 'express';

export const xFrameMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // X-Frame-Options configuration
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  console.log('SAMEORIGIN!');
  next();
};
