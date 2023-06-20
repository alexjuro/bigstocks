/* Autor: Alexander Schellenberg */
import { Request, Response, NextFunction } from 'express';

export const referrerPolicyMiddleware = (req: Request, res: Response, next: NextFunction) => {
  res.setHeader('Referrer-Policy', 'no-referrer');
  next();
};
