/* Author: Nico Pareigis */

import express from 'express';
import { GenericDAO } from '../models/generic.dao.js';
import { User } from '../models/user.js';
import { authService } from '../services/auth.service.js';

const router = express.Router();

router.get('/profile', authService.authenticationMiddleware, async (req, res) => {
  const dao: GenericDAO<User> = req.app.locals.userDAO;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...user } = (await dao.findOne(req.app.locals.user))!;
  res.status(200).json(user);
});

router.put('/profile', authService.authenticationMiddleware, async (req, res) => {
  const dao: GenericDAO<User> = req.app.locals.userDAO;
  const userData = req.body.userData;
  (await dao.findAll(userData))
    ? dao
        .update(userData)
        .then(() => res.status(200).json({ status: 'ok' }))
        .catch(() => res.status(500).json({ status: 'error' }))
    : dao
        .create(userData)
        .then(() => res.status(201).json({ status: 'ok' }))
        .catch(() => res.status(500).json({ status: 'error' }));
});

export default router;
