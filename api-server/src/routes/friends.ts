/* Author: Alexander Lensjak */

import express from 'express';
import { GenericDAO } from '../models/generic.dao.js';
import { User } from '../models/user.js';
import { Transaction } from '../models/transaction.js';
import { authService } from '../services/auth.service.js';

const router = express.Router();

function isFormValid(username: string) {
  const reUsername = /^[\w-.]{4,32}$/;
  const friendname = username;
  if (!reUsername.test(friendname)) {
    return false;
  }
  return true;
}

router.get('/', authService.authenticationMiddleware, async (req, res) => {
  const userDAO: GenericDAO<User> = req.app.locals.userDAO;
  const transactionDAO: GenericDAO<Transaction> = req.app.locals.transactionDAO;
  const filter: Partial<User> = { id: res.locals.user.id };

  try {
    const user = await userDAO.findOne(filter);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const friendsArray = user.friends;

    const friendsWithData = [];
    for (let i = 0; i < friendsArray.length; i++) {
      const friendObj = await userDAO.findOne({ username: friendsArray[i].username });
      if (friendObj) {
        const transactions = await transactionDAO.findAll({ userId: friendObj.id, status: false });

        let profit = 0;
        for (let j = 0; j < transactions.length; j++) {
          profit += transactions[i].sPrice - transactions[i].bPrice;
        }

        const friendspush = {
          username: friendObj.username,
          accepted: friendsArray[i].accepted,
          avatar: friendObj.avatar,
          profit: profit.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
            useGrouping: false
          })
        };

        friendsWithData.push(friendspush);
      }
    }

    const friends = friendsWithData.filter(
      (friend: { username: string; accepted: boolean }) => friend.accepted === true
    );
    const requests = friendsWithData.filter(
      (friend: { username: string; accepted: boolean }) => friend.accepted === false
    );

    res.status(200).json({ friends: friends, requests: requests });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while retrieving user stocks' });
  }
});

router.post('/', authService.authenticationMiddleware, async (req, res) => {
  const userDAO: GenericDAO<User> = req.app.locals.userDAO;
  const userId = res.locals.user.id;
  const friendname = req.body.username;

  if (!isFormValid(friendname)) {
    res.status(418).json('Invalid username');
    return;
  }

  const user = await userDAO.findOne({ id: userId });
  const friend = await userDAO.findOne({ username: friendname });

  if (friend && user) {
    if (user.username == friend.username) {
      const dontTryToAddYourself = 'Error: The given Username is yours';
      res.status(400).json(dontTryToAddYourself);
      return;
    }

    if (user.friends.some(f => f.username === friend.username)) {
      const alreadyAddedError = 'Error: This friend already send you an request or you are already friends';
      res.status(409).json(alreadyAddedError);
      return;
    }

    if (friend.friends.some(u => u.username === user.username)) {
      const alreadyAddedError = 'Error: You already send a request to that user';
      res.status(406).json(alreadyAddedError);
      return;
    }

    const newFriend = { username: user.username, accepted: false };

    friend.friends.push(newFriend);

    await userDAO.update(friend);

    res.status(200).json({ message: 'success' });
  } else {
    const error = 'user not found';
    res.status(404).json(error);
  }
});

router.post('/accept', authService.authenticationMiddleware, async (req, res) => {
  const userDAO: GenericDAO<User> = req.app.locals.userDAO;
  const userId = res.locals.user.id;
  const friendname = req.body.username;

  if (!isFormValid(friendname)) {
    res.status(418).json('Invalid username');
    return;
  }

  const user = await userDAO.findOne({ id: userId });
  const friend = await userDAO.findOne({ username: friendname });

  if (friend && user) {
    //searches the friendname in the friends of user and deletes the entry
    //I accept the request, so I have an entry with false in my Table
    const index = user.friends.findIndex(friend => friend.username === friendname);
    if (index !== -1) {
      user.friends.splice(index, 1);
    }
    const newFriend = { username: friendname, accepted: true };

    //My friend who send the request does not has an entry with false in his Table, so I create a new Entry for me
    const newUser = { username: user.username, accepted: true };

    user.friends.push(newFriend);
    friend.friends.push(newUser);

    await userDAO.update(user);
    await userDAO.update(friend);

    res.status(200).json({ message: 'accepted' });
  } else {
    const error = 'user not found';
    res.status(404).json(error);
  }
});

router.post('/decline', authService.authenticationMiddleware, async (req, res) => {
  const userDAO: GenericDAO<User> = req.app.locals.userDAO;
  const userId = res.locals.user.id;
  const friendname = req.body.username;

  if (!isFormValid(friendname)) {
    res.status(418).json('Invalid username');
    return;
  }

  const user = await userDAO.findOne({ id: userId });
  const friend = await userDAO.findOne({ username: friendname });

  if (friend && user) {
    //searches the friendname in the friends of user and deletes the entry
    const index = user.friends.findIndex(friend => friend.username === friendname);
    if (index !== -1) {
      user.friends.splice(index, 1);
    }

    await userDAO.update(user);
    await userDAO.update(friend);

    res.status(200).json({ message: 'declined' });
  } else {
    const error = 'user not found';
    res.status(404).json(error);
  }
});

router.post('/delete', authService.authenticationMiddleware, async (req, res) => {
  const userDAO: GenericDAO<User> = req.app.locals.userDAO;
  const userId = res.locals.user.id;
  const friendname = req.body.username;

  if (!isFormValid(friendname)) {
    res.status(418).json('Invalid username');
    return;
  }

  const user = await userDAO.findOne({ id: userId });
  const friend = await userDAO.findOne({ username: friendname });

  if (friend && user) {
    //searches the friendname in the friends of user and deletes the entry
    const index = user.friends.findIndex(friend => friend.username === friendname);
    if (index !== -1) {
      user.friends.splice(index, 1);
    }

    //searches the username in the friends of the friend and deletes the entry
    const indextwo = friend.friends.findIndex(friend => friend.username === user.username);
    if (indextwo !== -1) {
      friend.friends.splice(indextwo, 1);
    }

    await userDAO.update(user);
    await userDAO.update(friend);

    res.status(200).json({ message: 'deleted' });
  } else {
    const error = 'user not found';
    res.status(404).json(error);
  }
});

export default router;
