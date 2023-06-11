/* Autor: Alexander Schellenberg */

import express from 'express';
import { GenericDAO } from '../models/generic.dao.js';
import { Stock } from '../models/stock.js';
import { Transaction } from '../models/transaction.js';
import { User } from '../models/user.js';

import { authService } from '../services/auth.service.js';
import { cryptoService } from '../services/crypto.service.js';
import { Note } from '../models/note.js';
import xss from 'xss';

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

router.get('/details/:symbol', authService.authenticationMiddleware, async (req, res) => {
  const stockDAO: GenericDAO<Stock> = req.app.locals.stockDAO;
  const noteDAO: GenericDAO<Note> = req.app.locals.noteDAO;
  const symbol = req.params.symbol;
  const userId = res.locals.user.id;

  try {
    const stock = await stockDAO.findOne({ symbol });
    const note = await noteDAO.findOne({ symbol, userId });

    if (note) {
      note.note = cryptoService.decrypt(note.note);
    }

    if (!stock) {
      res.status(404).json({ error: 'Stock not found' });
      return;
    }

    res.json({ stock, note });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while retrieving stock details' });
  }
});

router.post('/', authService.authenticationMiddleware, async (req, res) => {
  const stockDAO: GenericDAO<Stock> = req.app.locals.stockDAO;
  const transactionDAO: GenericDAO<Transaction> = req.app.locals.transactionDAO;
  const userDAO: GenericDAO<User> = req.app.locals.userDAO;
  const userId = res.locals.user.id;

  if (!req.body.symbol || !req.body.name || !req.body.image || !req.body.bPrice || !req.body.pValue) {
    res.status(400).json({ error: 'Missing parameters' });
    return;
  }

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

    const moneyToDeduct = Number(bPrice);
    if (user.money < moneyToDeduct) {
      res.status(400).json({ error: 'Insufficient funds' });
      return;
    }

    const transaction = await transactionDAO.create({
      userId,
      symbol,
      name,
      image,
      bPrice,
      sPrice: 0,
      status: true,
      soldAt: 0
    });

    user.money = Number((user.money - moneyToDeduct).toFixed(2));

    await updatePerformance(user, pValue);
    await userDAO.update(user);

    res.status(201).json({ transaction, money: user.money, performance: user.performance });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while purchasing the stock' });
  }
});

router.post('/details', authService.authenticationMiddleware, async (req, res) => {
  const noteDAO: GenericDAO<Note> = req.app.locals.noteDAO;

  if (!req.body.note) {
    res.status(400).json({ error: 'Missing parameters' });
    return;
  }

  const { note } = req.body;
  const userId = res.locals.user.id;
  const cryptNote = cryptoService.encrypt(note.note);

  try {
    if (validation(note)) {
      res.status(403).json({ error: 'Potential Attack detected' });
    }
    const exNote = await noteDAO.findOne({ userId, symbol: note.symbol });
    if (exNote) {
      exNote.note = cryptNote;
      await noteDAO.update(exNote);
      res.status(200).json({ message: 'Note saved successfully' });
      return;
    }
    const newNote = await noteDAO.create({
      symbol: note.symbol,
      userId,
      note: cryptNote
    });

    res
      .status(200)
      .json({ message: 'Note saved successfully', note: cryptoService.encrypt(newNote.note || exNote!.note) });
  } catch (error) {
    res.status(500).json({ error: `An error occurred while saving the note ${noteDAO}` });
  }
});

router.patch('/', authService.authenticationMiddleware, async (req, res) => {
  const transactionDAO: GenericDAO<Transaction> = req.app.locals.transactionDAO;
  const userDAO: GenericDAO<User> = req.app.locals.userDAO;
  const userId = res.locals.user.id;

  if (!req.body.symbol || !req.body.sPrice || !req.body.pValue) {
    res.status(400).json({ error: 'Missing parameters' });
    return;
  }
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
    lowestPriceTransaction.soldAt = new Date().getTime();

    await transactionDAO.update(lowestPriceTransaction);

    user.money = Number((user.money + lowestPriceTransaction.sPrice).toFixed(2)); // Add the sell price to the user's money

    await updatePerformance(user, pValue);
    await userDAO.update(user);

    res
      .status(200)
      .json({ message: 'Transaction updated successfully', money: user.money, performance: user.performance });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while updating the transaction' });
  }
});

function validation(note: Note) {
  let result = false;

  const sqlInjectionPattern = /[';]|--|\/\*|\*\//gi;
  if (sqlInjectionPattern.test(note.note)) {
    result = true;
  }

  const sanitizedComment = xss(note.note);
  if (sanitizedComment !== note.note) {
    result = true;
  }

  return result;
}

export default router;
