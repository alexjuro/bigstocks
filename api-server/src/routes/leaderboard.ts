/* Author: Alexander Lesnjak */

import express, { Request, Response } from 'express';
import { GenericDAO } from '../models/generic.dao';
import { User } from '../models/user';
import { authService } from '../services/auth.service';

const router = express.Router();

router.get('/', async (req, res) => {
  const userDAO: GenericDAO<User> = req.app.locals.userDAO;
  try {
    const users = await userDAO.findAll();

    const leaderboard = users.map(user => ({
      name: user.name,
      money: user.money,
      performance: user.performance.slice(user.performance.length - 1, user.performance.length)
    }));
    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while retrieving user stocks' });
  }
});

export default router;
