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

    const friendsArray = friendsWithPerformance.map((friend: any) => {
      const newPerformance = friend.performance.map((performance: any) => {
        const formattedValue = performance.value.toLocaleString('de-DE', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
          useGrouping: false
        });

        return { ...performance, value: formattedValue };
      });

      return { ...friend, performance: newPerformance };
    });

    const friends = friendsArray.filter((friend: any) => friend.accepted === true);
    const requests = friendsArray.filter((friend: any) => friend.accepted === false);

    res.json({ friends: friends, requests: requests });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while retrieving user stocks' });
  }
});

router.post('/', authService.authenticationMiddleware, async (req, res) => {
  const userDAO: GenericDAO<User> = req.app.locals.userDAO;
  const userId = res.locals.user.id;
  const friendname = req.body.username;

  const user = await userDAO.findOne({ id: userId });
  const friend = await userDAO.findOne({ username: friendname });

  if (friend && user) {
    if (user.username == friend.username) {
      const dontTryToAddYourself = 'Error: The given Username is yours';
      res.status(400).json(dontTryToAddYourself);
      return;
    }

    if (user.friends.some(f => f.username === friend.username)) {
      const alreadyAddedError = 'Error: This friend already send you an request';
      res.status(409).json(alreadyAddedError);
      return;
    }

    const newFriend = { username: user.username, accepted: false };

    friend.friends.push(newFriend);

    await userDAO.update(friend);

    res.status(200);
  } else {
    const error = 'user not found';
    res.status(404).json(error);
  }
});

router.post('/accept', authService.authenticationMiddleware, async (req, res) => {
  const userDAO: GenericDAO<User> = req.app.locals.userDAO;
  const userId = res.locals.user.id;
  const friendname = req.body.username;

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

    res.status(200);
  } else {
    const error = 'user not found';
    res.status(404).json(error);
  }
});

router.post('/decline', authService.authenticationMiddleware, async (req, res) => {
  const userDAO: GenericDAO<User> = req.app.locals.userDAO;
  const userId = res.locals.user.id;
  const friendname = req.body.username;

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

    res.status(200);
  } else {
    const error = 'user not found';
    res.status(404).json(error);
  }
});

router.post('/delete', authService.authenticationMiddleware, async (req, res) => {
  const userDAO: GenericDAO<User> = req.app.locals.userDAO;
  const userId = res.locals.user.id;
  const friendname = req.body.username;

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

    res.status(200);
  } else {
    const error = 'user not found';
    res.status(404).json(error);
  }
});

export default router;
