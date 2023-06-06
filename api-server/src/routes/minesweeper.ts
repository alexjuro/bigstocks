/* Author: Alexander Lensjak */

import express from 'express';
import { GenericDAO } from '../models/generic.dao.js';
import { User } from '../models/user.js';
import { authService } from '../services/auth.service.js';

const router = express.Router();

router.get('/', authService.authenticationMiddleware, async (req, res) => {
  const dao: GenericDAO<User> = req.app.locals.userDAO;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const filter: Partial<User> = { id: res.locals.user.id };
  const user = await dao.findOne(filter);

  res.status(200).json(user);
});

/*router.post('/', authService.authenticationMiddleware, async (req, res) => {
  const dao: GenericDAO<User> = req.app.locals.userDAO;
  res.status(200);
});*/

router.post('/', authService.authenticationMiddleware, async (req, res) => {
  try {
    res.sendStatus(200);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

export default router;
