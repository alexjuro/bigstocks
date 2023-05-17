/* Author: Nico Pareigis */

import express from 'express';
import { GenericDAO } from '../models/generic.dao.js';
import { User } from '../models/user.js';
import { authService } from '../services/auth.service.js';

// TODO:
// * settle on primary key / identifying property
// * pattern / content validation

const isValidRequest = <T>(validProperties: string[], obj: T | unknown): obj is T => {
  return Object.getOwnPropertyNames(obj).map(p => validProperties.includes(p)).length == validProperties.length;
};

const router = express.Router();

router.get('/profile', authService.authenticationMiddleware, async (req, res) => {
  const dao: GenericDAO<User> = req.app.locals.userDAO;

  const { avatar, name, email, password } = (await dao.findOne(req.app.locals.user))!;
  const user = { avatar, name, email, password };

  email ? res.status(200).json(user) : res.status(404).json({ status: 'failed fetching user information' });
});

router.post('/profile/avatar', authService.authenticationMiddleware, async (req, res) => {
  type Avatar = Pick<User, 'avatar' | 'email'>;
  const dao: GenericDAO<User> = req.app.locals.userDAO;

  if (!isValidRequest<Avatar>(['avatar', 'email'], req.body)) return res.status(400).json({ status: 'bad request' });

  dao
    .update(req.body)
    .then(() => res.status(200).json({ status: 'ok' }))
    .catch(() => res.status(500).json({ status: 'error' }));
});

router.post('/profile/details', authService.authenticationMiddleware, async (req, res) => {
  type Details = Pick<User, 'email' | 'name'>;
  const dao: GenericDAO<User> = req.app.locals.userDAO;

  if (!isValidRequest<Details>(['email', 'name'], req.body)) return res.status(400).json({ status: 'bad request' });

  dao
    .update(req.body)
    .then(() => res.status(200).json({ status: 'ok' }))
    .catch(() => res.status(500).json({ status: 'error' }));
});

router.post('/profile/password', authService.authenticationMiddleware, async (req, res) => {
  type Password = Pick<User, 'email' | 'password'>;
  const dao: GenericDAO<User> = req.app.locals.userDAO;

  if (!isValidRequest<Password>(['email', 'password'], req.body))
    return res.status(400).json({ status: 'bad request' });

  dao
    .update(req.body)
    .then(() => res.status(200).json({ status: 'ok' }))
    .catch(() => res.status(500).json({ status: 'error' }));
});

export default router;
