/* Author: Alexander Schellenberg */

import express from 'express';
import { GenericDAO } from '../models/generic.dao.js';
import { Stock } from '../models/stock.js';
import { Transaction } from '../models/transaction.js';
import { User } from '../models/user.js';

import { authService } from '../services/auth.service.js';
import { cryptoService } from '../services/crypto.service.js';

const router = express.Router();

//Give back number of shares from symbol
async function getActiveStocks(userTransactions: Transaction[]): Promise<Record<string, number>> {
  const activeStocks: Record<string, number> = {};
  for (const transaction of userTransactions) {
    const { symbol } = transaction;
    activeStocks[symbol] = (activeStocks[symbol] || 0) + 1;
  }
  return activeStocks;
}

async function updatePerformance(user: User, pValue: number): Promise<void> {
  const today = new Date().toLocaleDateString();
  const existingPerformance = user.performance.find(entry => entry.date === today);
  if (existingPerformance) {
    existingPerformance.value = pValue;
  } else {
    user.performance.push({ date: today, value: pValue });
  }
  if (user.performance.length > 20) {
    user.performance.shift(); // Remove the oldest entry
  }
}

router.get('/', authService.authenticationMiddleware, async (req, res) => {
  const transactionDAO: GenericDAO<Transaction> = req.app.locals.transactionDAO;
  const userDAO: GenericDAO<User> = req.app.locals.userDAO;
  const userId = res.locals.user.id;

  try {
    const user = await userDAO.findOne({ id: userId });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const userTransactions = await transactionDAO.findAll({ userId, status: true });
    const activeStocks = await getActiveStocks(userTransactions);

    const stocksWithShares = Object.keys(activeStocks).map(symbol => ({
      symbol,
      name: userTransactions.find(transaction => transaction.symbol === symbol)?.name || '',
      image: userTransactions.find(transaction => transaction.symbol === symbol)?.image || '',
      shares: activeStocks[symbol]
    }));

    res.json({ results: stocksWithShares, money: user.money, performance: user.performance });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while retrieving user stocks' });
  }
});

router.get('/market', authService.authenticationMiddleware, async (req, res) => {
  const stockDAO: GenericDAO<Stock> = req.app.locals.stockDAO;
  const transactionDAO: GenericDAO<Transaction> = req.app.locals.transactionDAO;
  const userDAO: GenericDAO<User> = req.app.locals.userDAO;
  const userId = res.locals.user.id;

  try {
    const user = await userDAO.findOne({ id: userId });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const stocks = await stockDAO.findAll();
    const userTransactions = await transactionDAO.findAll({ userId, status: true });
    const activeStocks = await getActiveStocks(userTransactions);

    const stocksWithShares = stocks.map(stock => {
      const shares = activeStocks[stock.symbol] || 0;
      return { ...stock, shares };
    });

    res.json({ results: stocksWithShares, money: user.money, performance: user.performance });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while retrieving market stocks' });
  }
});

router.post('/', authService.authenticationMiddleware, async (req, res) => {
  const stockDAO: GenericDAO<Stock> = req.app.locals.stockDAO;
  const transactionDAO: GenericDAO<Transaction> = req.app.locals.transactionDAO;
  const userDAO: GenericDAO<User> = req.app.locals.userDAO;
  const userId = res.locals.user.id;

  const { symbol, name, image, bPrice, pValue } = req.body;

  try {
    const user = await userDAO.findOne({ id: userId });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const stock = await stockDAO.findOne({ symbol });
    if (!stock) {
      res.status(404).json({ error: 'Stock not found' });
      return;
    }

    const transaction = await transactionDAO.create({
      userId,
      symbol,
      name,
      image,
      bPrice,
      sPrice: 0,
      status: true
    });

    const moneyToDeduct = Number(bPrice);
    if (user.money < moneyToDeduct) {
      res.status(400).json({ error: 'Insufficient funds' });
      return;
    }

    user.money = Number((user.money - moneyToDeduct).toFixed(2));

    await updatePerformance(user, pValue);
    await userDAO.update(user);

    res.status(201).json({ transaction, money: user.money, performance: user.performance });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while purchasing the stock' });
  }
});

router.patch('/', authService.authenticationMiddleware, async (req, res) => {
  const transactionDAO: GenericDAO<Transaction> = req.app.locals.transactionDAO;
  const userDAO: GenericDAO<User> = req.app.locals.userDAO;
  const userId = res.locals.user.id;
  const { symbol, sPrice, pValue } = req.body;

  try {
    const user = await userDAO.findOne({ id: userId });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const userTransactions = await transactionDAO.findAll({ userId, symbol, status: true });
    if (userTransactions.length === 0) {
      res.status(404).json({ error: 'No active transactions found for the specified stock symbol' });
      return;
    }

    // Find the transaction with the lowest buy price
    let lowestPriceTransaction = userTransactions[0];
    for (const transaction of userTransactions) {
      if (transaction.bPrice < lowestPriceTransaction.bPrice) {
        lowestPriceTransaction = transaction;
      }
    }

    lowestPriceTransaction.sPrice = Number(sPrice.toFixed(2));
    lowestPriceTransaction.status = false;

    // Update the transaction
    await transactionDAO.update(lowestPriceTransaction);

    user.money = Number((user.money + lowestPriceTransaction.sPrice).toFixed(2)); // Add the sell price to the user's money

    await updatePerformance(user, pValue);
    await userDAO.update(user);

    res
      .status(202)
      .json({ message: 'Transaction updated successfully', money: user.money, performance: user.performance });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while updating the transaction' });
  }
});

export default router;
