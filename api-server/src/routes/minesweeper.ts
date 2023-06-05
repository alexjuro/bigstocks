/* Author: Alexander Lesnjak */

import express, { Request, Response } from 'express';
import { GenericDAO } from '../models/generic.dao';
import { User } from '../models/user';
import { authService } from '../services/auth.service';

const router = express.Router();

router.get('/', authService.authenticationMiddleware, async (req, res) => {
  const dao: GenericDAO<User> = req.app.locals.userDAO;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const filter: Partial<User> = { id: res.locals.user.id };
  const user = await dao.findOne(filter);

  res.status(200).json(user);
});

export default router;
