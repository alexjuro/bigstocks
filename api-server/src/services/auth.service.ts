/* Autor: Prof. Dr. Norman Lahme-Hütig (FH Münster) */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const SECRET = 'mysecret' + new Date().getTime();

class AuthService {
  authenticationMiddleware = (req: Request, res: Response, next: NextFunction) => {
    if (res.locals.user) {
      console.log(res.locals.user);
      next();
    } else {
      console.log(req.cookies);
      const token = req.cookies['jwt-token'] || '';
      try {
        res.locals.user = jwt.verify(token, SECRET);
        next();
      } catch {
        console.log(res.locals.user);
        res.status(401).json({ message: 'Please log in!' });
      }
    }
  };

  createAndSetToken(userClaimSet: Record<string, unknown>, res: Response) {
    const token = jwt.sign(userClaimSet, SECRET, { algorithm: 'HS256', expiresIn: '1h' });
    res.cookie('jwt-token', token);
  }

  createAndSetshortToken(userClaimSet: Record<string, unknown>, res: Response) {
    const token = jwt.sign(userClaimSet, SECRET, { algorithm: 'HS256', expiresIn: '240s' });
    res.cookie('jwt-token', token);
  }

  removeToken(res: Response) {
    res.clearCookie('jwt-token');
  }
}

export const authService = new AuthService();
