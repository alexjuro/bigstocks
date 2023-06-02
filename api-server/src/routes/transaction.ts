/* Author: Nico Pareigis */

import express from 'express';
import { GenericDAO } from '../models/generic.dao.js';
import { Transaction } from '../models/transaction.js';
import { authService } from '../services/auth.service.js';

const router = express.Router();

router.get('/', authService.authenticationMiddleware, async (req, res) => {
  const dao: GenericDAO<Transaction> = req.app.locals.transactionDAO;

  await dao
    .findAll(req.app.locals.user)
    .then(entities => {
      const keep = ['userId', 'name', 'image', 'bPrice', 'sPrice', 'soldAt', 'createdAt'];
      entities.map(e => {
        Object.getOwnPropertyNames(e).forEach(p => {
          if (!keep.includes(p)) Reflect.deleteProperty(e, p);
        });
      });

      const limit = Number(req.query.limit) || 10;
      const offset = Number(req.query.offset) || 0;
      res.status(200).json({
        total: entities.length,
        entities: entities.slice(offset, limit + offset),
        limit,
        offset
      });
    })
    .catch(() => res.status(404).json({ status: 'failed to fetch transactions' }));
});

export default router;
