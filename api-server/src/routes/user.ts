/* Author: Nico Pareigis */

import express from 'express';
import { GenericDAO } from '../models/generic.dao.js';
import { User } from '../models/user.js';
import { authService } from '../services/auth.service.js';

const router = express.Router();

router.get('/profile', authService.authenticationMiddleware, async (req, res) => {
  const dao: GenericDAO<User> = req.app.locals.userDAO;

  const { avatar, name, email, password } = (await dao.findOne(req.app.locals.user))!;
  const user = { avatar, name, email, password };

  email ? res.status(200).json(user) : res.status(404).json({ status: 'failed fetching user information' });
});

router.post('/profile/password', authService.authenticationMiddleware, async (req, res) => {
  const dao: GenericDAO<User> = req.app.locals.userDAO;

  // TODO: refactor to const string[]?
  type Pass = {
    email: string;
    password: string;
  };

  function isPass(obj: Pass): obj is Pass {
    const props = ['email', 'password'];
    return Object.getOwnPropertyNames(obj).map(n => props.includes(n)).length == props.length;
  }

  if (!isPass(req.body)) return res.status(400).json({ status: 'bad request' });

  dao
    .update(req.body)
    .then(() => res.status(200).json({ status: 'ok' }))
    .catch(() => res.status(500).json({ status: 'error' }));
});

export default router;
