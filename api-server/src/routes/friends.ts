/* Author: Alexander Lensjak */
//TODO: username hardcoded

import express from 'express';
import { GenericDAO } from '../models/generic.dao.js';
import { User } from '../models/user.js';
import { authService } from '../services/auth.service.js';

const router = express.Router();

router.get('/', authService.authenticationMiddleware, async (req, res) => {
  const userDAO: GenericDAO<User> = req.app.locals.userDAO;
  const filter: Partial<User> = { id: res.locals.user.id };

  try {
    const user = await userDAO.findOne(filter);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const friendsWithPerformance = await Promise.all(
      user.friends.map(async friend => {
        const friendUser = await userDAO.findOne({ username: friend.username });
        if (!friendUser) {
          return {
            username: friend.username,
            accepted: friend.accepted,
            avatar: null,
            performance: null // or any default value if the friend user is not found
          };
        }

        return {
          username: friend.username,
          accepted: friend.accepted,
          avatar: friendUser.avatar,
          performance: friendUser.performance.slice(friendUser.performance.length - 1, friendUser.performance.length) // Assuming the performance property exists in the friend user object
        };
      })
    );

    res.json({ friends: friendsWithPerformance });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while retrieving user stocks' });
  }
});

router.post('/', authService.authenticationMiddleware, async (req, res) => {
  const userDAO: GenericDAO<User> = req.app.locals.userDAO;
  const userId = res.locals.user.id;
  const friendname = 'axel';

  const user = await userDAO.findOne({ id: userId });
  const friend = await userDAO.findOne({ username: friendname });

  if (friend && user) {
    const newFriend = { username: friend.username, accepted: false };

    if (user.username == friend.username) {
      const dontTryToAddYourself = 'Error: The given Username is yours';
      res.status(400).json(dontTryToAddYourself);
      return;
    }

    if (user.friends.some(f => f.username === friend.username)) {
      const alreadyAddedError = 'Error: You already added that friend';
      res.status(409).json(alreadyAddedError);
      return;
    }

    const newUser = { username: user.username, accepted: false };

    user.friends.push(newFriend);
    friend.friends.push(newUser);

    await userDAO.update(user);
    await userDAO.update(friend);

    res.status(200);
  } else {
    const error = 'user not found';
    res.status(404).json(error);
  }
});

export default router;
