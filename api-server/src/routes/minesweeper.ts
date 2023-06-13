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

  if (user) {
    if (user.tries.date != new Date().toLocaleDateString()) {
      user.tries.date = new Date().toLocaleDateString();
      user.tries.value = 3;
    }

    await dao.update(user);

    res.status(200).json({ username: user?.username, tries: user?.tries, money: user?.money });
  }
});

router.post('/restart', authService.authenticationMiddleware, async (req, res) => {
  const dao: GenericDAO<User> = req.app.locals.userDAO;
  const userId = res.locals.user.id;

  const user = await dao.findOne({ id: userId });

  if (user) {
    const oldtries = user.tries.value;
    user.tries.value = oldtries - 1;

    await dao.update(user);
    res.status(200).json({ message: 'updated tries' });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

router.post('/victory', authService.authenticationMiddleware, async (req, res) => {
  const dao: GenericDAO<User> = req.app.locals.userDAO;
  const filter: Partial<User> = { id: res.locals.user.id };

  try {
    const user = await dao.findOne(filter);

    if (user) {
      const oldmoney = user.money;
      user.money = oldmoney + 500;

      await dao.update(user);
      res.status(200).json({ money: user.money });
    }
  } catch (e) {
    res.status(404);
  }
});

export default router;
