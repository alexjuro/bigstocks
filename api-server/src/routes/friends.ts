/* Author: Alexander Lensjak */
//TODO: return live performance

import express from 'express';
import { GenericDAO } from '../models/generic.dao.js';
import { User } from '../models/user.js';
import { authService } from '../services/auth.service.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const userDAO: GenericDAO<User> = req.app.locals.userDAO;
  const email = 'al568412@fh-muenster.de';

  try {
    const user = await userDAO.findOne({ email: email });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const friendsWithPerformance = await Promise.all(
      user.friends.map(async friend => {
        const friendUser = await userDAO.findOne({ email: 'al568412@fh-muenster.de' });
        if (!friendUser) {
          return {
            name: friend.name,
            accepted: friend.accepted,
            performance: null // or any default value if the friend user is not found
          };
        }

        return {
          name: friend.name,
          accepted: friend.accepted,
          performance: friendUser.performance.slice(friendUser.performance.length - 1, friendUser.performance.length) // Assuming the performance property exists in the friend user object
        };
      })
    );

    res.json({ friends: friendsWithPerformance });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while retrieving user stocks' });
  }
});

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
      if (user?.friends.some(friend => friend.name === req.body.friend)) {
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
});

export default router;
