/* Author: Alexander Lesnjak */

import express, { Request, Response } from 'express';
import { GenericDAO } from '../models/generic.dao';
import { User } from '../models/user';
import { Transaction } from '../models/transaction';
import { authService } from '../services/auth.service.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const userDAO: GenericDAO<User> = req.app.locals.userDAO;
  try {
    const users = await userDAO.findAll();

    const leaderboard = users.map(user => ({
      username: user.username,
      avatar: user.avatar,
      score: user.performance[0]
    }));

    leaderboard.sort((a, b) => {
      if (a.score < b.score) {
        return 1;
      }
      if (a.score > b.score) {
        return -1;
      }
      return 0;
    });

    res.status(200).json({ global: leaderboard.slice(0, 5) });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while retrieving user stocks' });
  }
});

router.get('/lastWeek', authService.authenticationMiddleware, async (req, res) => {
  const userDAO: GenericDAO<User> = req.app.locals.userDAO;
  const transactionDAO: GenericDAO<Transaction> = req.app.locals.transactionDAO;
  const userId = res.locals.user.id;

  //const randomdate = new Date('June 7, 2023 23:15:30');

  const dateOneWeekAgo = new Date();
  dateOneWeekAgo.setDate(dateOneWeekAgo.getDate() - 7);
  dateOneWeekAgo.setHours(0, 0, 0, 0);

  const allTransaction = await transactionDAO.findAll({ status: false });

  const allProfit = [];

  //returns all transaction made in the last week
  for (let i = 0; i < allTransaction.length; i++) {
    if (allTransaction[i].createdAt >= dateOneWeekAgo.getTime()) {
      const entry = {
        userId: allTransaction[i].userId,
        profit: allTransaction[i].sPrice - allTransaction[i].bPrice
      };
      allProfit.push(entry);
    }
  }

  // Sums up all profits by userId and convert it
  const totalProfits: { [userId: string]: number } = calculateTotalProfit(allProfit);
  const totalProfitsArray: { userId: string; profit: number }[] = Object.entries(totalProfits).map(
    ([userId, profit]) => ({ userId, profit })
  );

  // Sort the array by profit and slice it
  totalProfitsArray.sort((a, b) => b.profit - a.profit);

  const leaderboardSize = 5;
  const leaderboard = [];

  for (let i = 0; i < Math.min(leaderboardSize, totalProfitsArray.length); i++) {
    const user = await userDAO.findOne({ id: totalProfitsArray[i].userId });

    if (user) {
      const profitpush = {
        username: user.username,
        avatar: user.avatar,
        profit: totalProfitsArray[i].profit.toLocaleString('de-DE', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
          useGrouping: false
        })
      };
      leaderboard.push(profitpush);
    }
  }

  res.status(200).json(leaderboard);
});

interface UserProfit {
  userId: string;
  profit: number;
}

function calculateTotalProfit(userProfits: UserProfit[]): { [userId: string]: number } {
  const result: { [userId: string]: number } = {};

  for (const { userId, profit } of userProfits) {
    if (result[userId]) {
      result[userId] += profit;
    } else {
      result[userId] = profit;
    }
  }

  return result;
}

export default router;
