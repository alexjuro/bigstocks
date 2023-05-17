/* Author: Alexander Schellenberg */

import express from 'express';
import { GenericDAO } from '../models/generic.dao.js';
import { Stock } from '../models/stock.js';
import { Transaction } from '../models/transaction.js';

import { authService } from '../services/auth.service.js';
import { cryptoService } from '../services/crypto.service.js';

const router = express.Router();

async function getActiveStocks(userTransactions: Transaction[]): Promise<Record<string, number>> {
  const activeStocks: Record<string, number> = {};
  for (const transaction of userTransactions) {
    const { symbol } = transaction;
    activeStocks[symbol] = activeStocks[symbol] ? activeStocks[symbol] + 1 : 1;
  }
  return activeStocks;
}

router.get('/', authService.authenticationMiddleware, async (req, res) => {
  const transactionDAO: GenericDAO<Transaction> = req.app.locals.transactionDAO;
  const userTransactions = await transactionDAO.findAll({ userId: res.locals.user.id, status: true });
  const activeStocks = await getActiveStocks(userTransactions);

  const stocksWithShares = userTransactions
    .filter(transaction => activeStocks[transaction.symbol] > 0)
    .map(transaction => ({
      symbol: transaction.symbol,
      name: transaction.name,
      imgsrc: transaction.imgsrc,
      shares: activeStocks[transaction.symbol]
    }));

  res.json({ results: stocksWithShares });
});

router.get('/market', authService.authenticationMiddleware, async (req, res) => {
  const stockDAO: GenericDAO<Stock> = req.app.locals.stockDAO;
  const transactionDAO: GenericDAO<Transaction> = req.app.locals.transactionDAO;
  const stocks = await stockDAO.findAll();
  const userTransactions = await transactionDAO.findAll({ userId: res.locals.user.id, status: true });
  const activeStocks = await getActiveStocks(userTransactions);

  const stocksWithShares = stocks.map(stock => {
    const shares = activeStocks[stock.symbol] || 0;
    return { ...stock, shares };
  });

  res.json({ results: stocksWithShares });
});

export default router;
