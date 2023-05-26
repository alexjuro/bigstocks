/* Author: Nico Pareigis */

import express from 'express';
import { GenericDAO } from '../models/generic.dao.js';
import { User } from '../models/user.js';
import { authService } from '../services/auth.service.js';
import bcrypt from 'bcryptjs';

const isValid = <T>(properties: Map<string, string>, obj: unknown): obj is T => {
  console.log(properties.get('regex'));
  return (
    Object.getOwnPropertyNames(obj)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map(p => (obj as any)[p] !== null && properties.has(p) && properties.get(p) === typeof (obj as any)[p])
      .filter(Boolean).length === properties.size
  );
};

const router = express.Router();

router.get('/', authService.authenticationMiddleware, async (req, res) => {
  const dao: GenericDAO<User> = req.app.locals.userDAO;

  await dao
    .findOne(req.app.locals.user)
    .then(entity => {
      if (!entity) return Promise.reject();

      const { id, avatar, name, email, password } = entity;
      res.status(200).json({ id, avatar, name, email, password });
    })
    .catch(() => res.status(404).json({ status: 'failed to fetch user information' }));
});

router.post('/avatar', authService.authenticationMiddleware, async (req, res) => {
  type Avatar = Pick<User, 'id' | 'avatar'>;

  const re = /^data:image\/(jpe?g|png);base64,/;
  const dao: GenericDAO<User> = req.app.locals.userDAO;

  if (
    !(
      isValid<Avatar>(
        new Map([
          ['id', 'number'],
          ['avatar', 'string']
        ]),
        req.body
      ) && re.test(req.body.avatar)
    )
  )
    return res.status(400).json({ status: 'bad request' });

  dao
    .update(req.body)
    .then(() => res.status(200).json({ status: 'ok' }))
    .catch(() => res.status(500).json({ status: 'error' }));
});

router.post('/details', authService.authenticationMiddleware, async (req, res) => {
  type Details = Pick<User, 'id' | 'email' | 'name'>;

  // equivalent to internal validation for 'input type="email"' (see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/email#basic_validation)
  const reEmail =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  const reName = /^[\w-.]{4,32}$/;
  const dao: GenericDAO<User> = req.app.locals.userDAO;

  if (
    !(
      isValid<Details>(
        new Map([
          ['id', 'number'],
          ['email', 'string'],
          ['name', 'string']
        ]),
        req.body
      ) &&
      reEmail.test(req.body.email) &&
      reName.test(req.body.name)
    )
  )
    return res.status(400).json({ status: 'bad request' });

  dao
    .update(req.body)
    .then(() => res.status(200).json({ status: 'ok' }))
    .catch(() => res.status(500).json({ status: 'error' }));
});

router.post('/password', authService.authenticationMiddleware, async (req, res) => {
  type Password = Pick<User, 'id' | 'password'>;
  const dao: GenericDAO<User> = req.app.locals.userDAO;
  const re = /^(?=.*?[a-z])(?=.*?[A-Z])(?=.*?\d).{8,32}$/;

  if (
    !(
      isValid<Password>(
        new Map([
          ['id', 'number'],
          ['password', 'string']
        ]),
        req.body
      ) && re.test(req.body.password)
    )
  )
    return res.status(400).json({ status: 'bad request' });

  const data = req.body;
  data.password = await bcrypt.hash(data.password, 10);

  dao
    .update(data)
    .then(() => res.status(200).json({ status: 'ok' }))
    .catch(() => res.status(500).json({ status: 'error' }));
});

export default router;
