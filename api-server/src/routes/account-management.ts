/* Autor: Nico Pareigis */

import express from 'express';
import { GenericDAO } from '../models/generic.dao.js';
import { User } from '../models/user.js';
import { authService } from '../services/auth.service.js';
import bcrypt from 'bcryptjs';

const isValid = <T>(properties: Map<string, string>, obj: unknown): obj is T => {
  const map = Object.getOwnPropertyNames(obj).map(
    // unknown appropriate for pramater; needs cast to validate property
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    p => (obj as any)[p] !== null && properties.has(p) && properties.get(p) === typeof (obj as any)[p]
  );
  return map.length === properties.size && map.every(Boolean);
};

const router = express.Router();

router.get('/', authService.authenticationMiddleware, async (req, res) => {
  const dao: GenericDAO<User> = req.app.locals.userDAO;

  await dao
    .findOne({ id: res.locals.user.id })
    .then(entity => {
      if (!entity) return Promise.reject();

      const { id, avatar, username, email, password } = entity;
      res.status(200).json({ id, avatar, username, email, password });
    })
    .catch(() => res.status(404).json({ status: 'failed to fetch user information' }));
});

router.put('/avatar', authService.authenticationMiddleware, async (req, res) => {
  type Avatar = Pick<User, 'id' | 'avatar'>;

  const re = /^data:image\/(jpe?g|png);base64,/;
  const prefixLength = 'data:image/jpeg;base64,'.length;
  const dao: GenericDAO<User> = req.app.locals.userDAO;

  if (
    !(
      isValid<Avatar>(
        new Map([
          ['id', 'string'],
          ['avatar', 'string']
        ]),
        req.body
      ) &&
      (re.test(req.body.avatar) || req.body.avatar === '') &&
      req.body.avatar.length <= 1024 * 200 + prefixLength
    )
  )
    return res.status(400).json({ status: 'bad request' });

  dao
    .update(req.body)
    .then(() => res.status(200).json({ status: 'ok' }))
    .catch(() => res.status(500).json({ status: 'error' }));
});

router.put('/details', authService.authenticationMiddleware, async (req, res) => {
  type Details = Pick<User, 'id' | 'email' | 'username'>;

  // equivalent to internal validation for 'input type="email"' (see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/email#basic_validation)
  const reEmail =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  const reName = /^[\w-.]{4,32}$/;
  const dao: GenericDAO<User> = req.app.locals.userDAO;

  if (
    !(
      isValid<Details>(
        new Map([
          ['id', 'string'],
          ['email', 'string'],
          ['username', 'string']
        ]),
        req.body
      ) &&
      reEmail.test(req.body.email) &&
      reName.test(req.body.username)
    )
  )
    return res.status(400).json({ status: 'bad request' });

  dao
    .update(req.body)
    .then(() => res.status(200).json({ status: 'ok' }))
    .catch(() => res.status(500).json({ status: 'error' }));
});

router.put('/password', authService.authenticationMiddleware, async (req, res) => {
  type Password = Pick<User, 'id' | 'password'>;
  const dao: GenericDAO<User> = req.app.locals.userDAO;
  const re = /^(?=.*?[a-z])(?=.*?[A-Z])(?=.*?\d).{8,32}$/;

  if (
    !(
      isValid<Password>(
        new Map([
          ['id', 'string'],
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
