/* Autor: Alexander Schellenberg */

import express from 'express';
import { GenericDAO } from '../models/generic.dao.js';
import { Stock } from '../models/stock.js';
import { Transaction } from '../models/transaction.js';
import { User } from '../models/user.js';

import { authService } from '../services/auth.service.js';
import { cryptoService } from '../services/crypto.service.js';
import { Note } from '../models/note.js';

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

// get user stocks for portfolio
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

// get all stocks in market with or without shares
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

// get details for stock
router.get('/details/:symbol', authService.authenticationMiddleware, async (req, res) => {
  const stockDAO: GenericDAO<Stock> = req.app.locals.stockDAO;
  const noteDAO: GenericDAO<Note> = req.app.locals.noteDAO;
  const symbol = req.params.symbol;
  const userId = res.locals.user.id;

  try {
    const stock = await stockDAO.findOne({ symbol });
    const note = await noteDAO.findOne({ symbol, userId });

    if (note) {
      const n = cryptoService.decrypt(note.note);
      note.note = decodeFromMongoDB(n);
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

// buy stock
router.post('/', authService.authenticationMiddleware, async (req, res) => {
  const stockDAO: GenericDAO<Stock> = req.app.locals.stockDAO;
  const transactionDAO: GenericDAO<Transaction> = req.app.locals.transactionDAO;
  const userDAO: GenericDAO<User> = req.app.locals.userDAO;
  const userId = res.locals.user.id;
  const errors: string[] = [];

  if (hasNotRequiredFields(req.body, ['symbol', 'name', 'image', 'bPrice', 'pValue'], errors)) {
    res.status(400).json({ message: errors.join('\n') });
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

// post note to details
router.post('/details', authService.authenticationMiddleware, async (req, res) => {
  const noteDAO: GenericDAO<Note> = req.app.locals.noteDAO;

  const errors: string[] = [];

  if (hasNotRequiredFields(req.body, ['note'], errors)) {
    res.status(400).json({ message: errors.join('\n') });
    return;
  }

  const { note } = req.body;
  const userId = res.locals.user.id;
  const safeNote = sanitizeInput(note.note);

  const cryptNote = cryptoService.encrypt(escapeForMongoDB(safeNote));

  try {
    if (!validate(note.note) || safeNote == 'Invalid Input') {
      res.status(403).json({ error: 'Potential Attack detected' });
      return;
    }
    const exNote = await noteDAO.findOne({ userId, symbol: note.symbol });
    if (exNote) {
      exNote.note = cryptNote;
      await noteDAO.update(exNote);
      res.status(200).json({ message: 'Note saved successfully' });
      return;
    }
    await noteDAO.create({
      symbol: note.symbol,
      userId,
      note: cryptNote
    });

    res.status(200).json({
      message: 'Note saved successfully',
      note: cryptoService.encrypt(escapeForMongoDB(cryptNote))
    });
  } catch (error) {
    res.status(500).json({ error: `An error occurred while saving the note ${noteDAO}` });
  }
});

// sell stock
router.patch('/', authService.authenticationMiddleware, async (req, res) => {
  const transactionDAO: GenericDAO<Transaction> = req.app.locals.transactionDAO;
  const userDAO: GenericDAO<User> = req.app.locals.userDAO;
  const userId = res.locals.user.id;

  const errors: string[] = [];

  if (hasNotRequiredFields(req.body, ['symbol', 'sPrice', 'pValue'], errors)) {
    res.status(400).json({ message: errors.join('\n') });
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

function validate(note: string) {
  let result = true;
  const allowedCharacters = /^[a-zA-Z0-9 !.<>()$&#;]+$/;

  if (!allowedCharacters.test(note)) {
    result = false;
  }

  if (note.length > 500) {
    result = false;
  }
  return result;
}

function sanitizeInput(input: string) {
  const safeCharacters = /^[a-zA-Z0-9 !.&<$!?#;]+$/;
  const safeTags = /<(?!(?:\/\s*)?(?:script|template|style)\b)[^>]*>/i;
  const safeEventHandlers = /(?<!\w)on\w+=/i;
  const safeInput = input.replace(safeTags, '').replace(safeEventHandlers, '');

  const sanitizedInput = safeInput
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');

  if (!safeCharacters.test(sanitizedInput)) {
    return 'Invalid Input';
  }

  return safeInput;
}

function hasNotRequiredFields(object: { [key: string]: unknown }, requiredFields: string[], errors: string[]) {
  let hasErrors = false;
  requiredFields.forEach(fieldName => {
    if (!object[fieldName]) {
      errors.push(fieldName + ' can not be empty');
      hasErrors = true;
    }
  });
  return hasErrors;
}

function escapeForMongoDB(value: string) {
  if (typeof value !== 'string') {
    return value;
  }

  const escapedValue = value
    .replace(/:/g, '\\:') // Colon (:)
    .replace(/"/g, '\\"') // Double quotes (")
    .replace(/'/g, "\\'") // Single quotes (')
    .replace(/\\/g, '\\\\'); // Backslash (\)

  return escapedValue;
}

function decodeFromMongoDB(value: string) {
  if (typeof value !== 'string') {
    return value;
  }

  const decodedValue = value
    .replace(/\\'/g, "'") // Single quotes (')
    .replace(/\\"/g, '"') // Double quotes (")
    .replace(/\\:/g, ':') // Colon (:)
    .replace(/\\\\/g, '\\'); // Backslash (\)

  return decodedValue;
}

export default router;
