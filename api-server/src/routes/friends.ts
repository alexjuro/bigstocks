/* Author: Alexander Lensjak */

import express from 'express';
import { GenericDAO } from '../models/generic.dao.js';
import { User } from '../models/user.js';
import { authService } from '../services/auth.service.js';

const router = express.Router();

router.get('/friends', authService.authenticationMiddleware, async (req, res) => {
  const userDAO: GenericDAO<User> = req.app.locals.userDAO;
  const filter: Partial<User> = { name: req.app.locals.user };
  const userObject = await userDAO.findOne(filter);

  if (userObject) {
    const friendsArray = userObject.friends.map(friend => friend.name);

    res.status(200).json({ friendsArray });
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

router.post('/friends', authService.authenticationMiddleware, async (req, res) => {
  const userDAO: GenericDAO<User> = req.app.locals.userDAO;
  const errors: string[] = [];

  const sendErrMsg = (message: string) => {
    authService.removeToken(res);
    res.status(400).json({ message });
  };

  const filter: Partial<User> = { name: req.app.locals.user };

  if (await userDAO.findOne(filter)) {
    const userObject = await userDAO.findOne(filter);
    const friendExists = userObject?.friends.some(friend => friend.name === req.body.friend);

    if (friendExists) {
      return sendErrMsg('You are already friends');
    } else {
      // Der Benutzer hat keinen Freund mit dem Namen "Alex"
      const newFriend = { name: 'Alex', accepted: false };
      userObject?.friends.push(newFriend);

      // Benutzer aktualisieren
      if (userObject) {
        await userDAO.update(userObject);
      }
      res.status(200);
    }
  } else {
    return sendErrMsg('The User was not found');
  }
});

export default router;
