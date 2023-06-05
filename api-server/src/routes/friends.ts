/* Author: Alexander Lensjak */
//TODO: return live performance

import express from 'express';
import { GenericDAO } from '../models/generic.dao.js';
import { User } from '../models/user.js';
import { authService } from '../services/auth.service.js';

const router = express.Router();

/*router.get('/', authService.authenticationMiddleware, async (req, res) => {
  const dao: GenericDAO<User> = req.app.locals.userDAO;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const filter: Partial<User> = { id: res.locals.user.id };
  const user = await dao.findOne(filter);

  res.status(200).json(user);
});*/

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
        const friendUser = await userDAO.findOne({ email: friend.email });
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

/*
router.post('/', async (req, res) => {
  const userDAO: GenericDAO<User> = req.app.locals.userDAO;
  const email = 'al568412@fh-muenster.de';

  try {
    const user = await userDAO.findOne({ email: email });

    //wenn der freund nicht gefunden wurde
    if (!(await userDAO.findOne({ name: req.body.friend }))) {
      res.status(400).json({ error: "The friend couldn't be found" });
    } else {
      //wenn sie bereits freunde sind
      if (user?.friends.some(friend => friend.username === req.body.friend)) {
        res.status(401).json({ error: 'You are already friends' });
      } else {
        const newFriend = { name: 'Alex', accepted: false };
        user?.friends.push(newFriend);

        // Benutzer aktualisieren
        if (user) {
          await userDAO.update(user);
        }
        res.send(200);
      }
    }
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while retrieving user stocks' });
  }
});*/

export default router;
