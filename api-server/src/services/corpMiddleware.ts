import { Request, Response, NextFunction } from 'express';

export const corpMiddleware = (req: Request, res: Response, next: NextFunction) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
  next();
};
