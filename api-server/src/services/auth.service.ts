/* Autor: Prof. Dr. Norman Lahme-Hütig (FH Münster) */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
const TokenExpiredError = jwt.TokenExpiredError;

const SECRET = 'mysecret' + new Date().getTime();

class AuthService {
  authenticationMiddleware = (req: Request, res: Response, next: NextFunction) => {
    if (res.locals.user) {
      next();
    } else {
      const token = req.cookies['jwt-token'] || '';
      try {
        res.locals.user = jwt.verify(token, SECRET);
        next();
      } catch {
        res.status(401).json({ message: 'Unauthorized!' });
      }
    }
  };

  createAndSetToken(userClaimSet: Record<string, unknown>, res: Response) {
    const token = jwt.sign(userClaimSet, SECRET, { algorithm: 'HS256', expiresIn: '1h' });
    res.cookie('jwt-token', token);
  }
  //Vom Lakzan Nathan
  createAndSetShortToken(userClaimSet: Record<string, unknown>, res: Response) {
    const token = jwt.sign(userClaimSet, SECRET, { algorithm: 'HS256', expiresIn: '10min' });
    res.cookie('jwt-token', token);
  }

  removeToken(res: Response) {
    res.clearCookie('jwt-token');
  }

  //Für Activation dass danach der Account gelöscht wird, Von Lakzan Nathan
  authenticationMiddlewareActivation = (req: Request, res: Response, next: NextFunction) => {
    if (res.locals.user) {
      next();
    } else {
      const token = req.cookies['jwt-token'] || '';
      try {
        res.locals.user = jwt.verify(token, SECRET);
        next();
      } catch (error) {
        if (error instanceof TokenExpiredError) {
          res.locals.user = jwt.decode(token);
          next();
        } else {
          res.status(401).json({ message: 'Unauthorized!' });
        }
      }
    }
  };
}

export const authService = new AuthService();
