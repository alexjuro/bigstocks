import { Request, Response, NextFunction } from 'express';
// hstsMiddleware.js
export const hstsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // HSTS-Konfiguration
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  next();
};
