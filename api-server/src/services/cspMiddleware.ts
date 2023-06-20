/* Autor: Alexander Schellenberg */
import { Request, Response, NextFunction } from 'express';

// cspMiddleware.js
export const cspMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // CSP-Konfiguration
  res.setHeader('Content-Security-Policy', "script-src 'self'; style-src 'self'; frame-ancestors 'none'");
  next();
};
