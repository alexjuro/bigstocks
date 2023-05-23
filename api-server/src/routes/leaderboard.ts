/* Author: Alexander Lesnjak */

import express, { Request, Response } from 'express';
import { GenericDAO } from '../models/generic.dao';
import { User } from '../models/user';
import { authService } from '../services/auth.service';

const router = express.Router();

router.get('/leaderboard', authService.authenticationMiddleware, async (req: Request, res: Response) => {
  const userDAO: GenericDAO<User> = req.app.locals.userDAO;

  try {
    const users = await userDAO.findAll();
    const leaderboard = users.map(user => ({
      name: user.name,
      money: user.money
    }));

    // Sortiere das Leaderboard nach der Geldsumme absteigend
    leaderboard.sort((a, b) => b.money - a.money);

    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ error: 'Fehler beim Abrufen des Leaderboards' });
  }
});

export default router;
