/* Autor: Alexander Schellenberg */
import { Request, Response, NextFunction } from 'express';

export const xContentTypeMiddleware = (req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  console.log('XCONTENT!');
  next();
};
