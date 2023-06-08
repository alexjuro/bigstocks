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
    if (user.trials.date != new Date().toLocaleDateString()) {
      user.trials.date = new Date().toLocaleDateString();
      user.trials.value = 3;
    }

    await dao.update(user);

    res.status(200).json({ username: user?.username, trials: user?.trials, money: user?.money });
  }
});

router.post('/', authService.authenticationMiddleware, async (req, res) => {
  try {
    res.sendStatus(200);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

router.post('/restart', authService.authenticationMiddleware, async (req, res) => {
  const dao: GenericDAO<User> = req.app.locals.userDAO;
  const userId = res.locals.user.id;

  const user = await dao.findOne({ id: userId });

  if (user) {
    const oldtrials = user.trials.value;
    user.trials.value = oldtrials - 1;

    await dao.update(user);
    res.status(200).json({ message: 'updated tries' });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

router.post('/victory', authService.authenticationMiddleware, async (req, res) => {
  const dao: GenericDAO<User> = req.app.locals.userDAO;
  const userId = res.locals.user.id;

  const user = await dao.findOne({ id: userId });

  if (user) {
    const oldmoney = user.money;
    user.money = oldmoney + 500;

    await dao.update(user);
    res.status(200).json({ message: 'updated money' });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

export default router;
