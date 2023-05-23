import express from 'express';
import bcrypt from 'bcryptjs';
import { GenericDAO } from '../models/generic.dao.js';
import { User } from '../models/user.js';
import { authService } from '../services/auth.service.js';
import nodemailer from 'nodemailer';
import { json } from 'stream/consumers';

const router = express.Router();
const transporter = nodemailer.createTransport({
  host: 'mail.fh-muenster.de',
  port: 25
});

router.post('/activation', authService.authenticationMiddleware, async (req, res) => {
  const userDAO: GenericDAO<User> = req.app.locals.userDAO;
  const errors: string[] = [];
  if (!res.locals.user) {
    // Token nicht gesetzt oder ungültig
    res.status(401).json({ message: 'Please log in!' });
    return;
  }

  const sendErrMsg = (message: string) => {
    authService.removeToken(res);
    res.status(400).json({ message });
  };
  if (hasNotRequiredFields(req.body, ['code', 'password', 'passwordCheck'], errors)) {
    return sendErrMsg(errors.join('\n'));
  }
  if (req.body.password !== req.body.passwordCheck) {
    console.log(req.body.password + ' ' + req.body.passwordCheck);
    return sendErrMsg('The two passwords do not match.');
  }
  const filter: Partial<User> = { id: res.locals.user.id };
  const user = await userDAO.findOne(filter);
  if (parseInt(req.body.code) !== user?.code) {
    console.log(req.body.code);
    console.log(user?.code);
    return sendErrMsg('Wrong code');
  }
  filter.activation = true;
  filter.code = 0;
  filter.password = await bcrypt.hash(req.body.password, 10);
  await userDAO.update(filter);
  authService.createAndSetToken({ id: res.locals.user.id }, res);

  res.status(201).json(user);
});

router.post('/sign-up', async (req, res) => {
  const userDAO: GenericDAO<User> = req.app.locals.userDAO;
  const errors: string[] = [];

  const sendErrMsg = (message: string) => {
    authService.removeToken(res);
    res.status(400).json({ message });
  };

  if (hasNotRequiredFields(req.body, ['email', 'name'], errors)) {
    return sendErrMsg(errors.join('\n'));
  }

  // if (req.body.password !== req.body.passwordCheck) {
  //   return sendErrMsg('The two passwords do not match.');
  // }

  const filter: Partial<User> = { email: req.body.email };
  if (await userDAO.findOne(filter)) {
    return sendErrMsg('There is already an account with the specified email address.');
  }

  const filter2: Partial<User> = { username: req.body.username };
  if (await userDAO.findOne(filter)) {
    return sendErrMsg('There is already an account with the specified name.');
  }
  const newCode = createNumber();
  const newUser = await userDAO.create({
    username: req.body.name,
    email: req.body.email,
    password: 'wait for activation',
    activation: false,
    code: newCode,
    new: true,
    rating: false
  });
  await sendCode(newUser.email, newCode);
  authService.createAndSetToken({ id: newUser.id }, res);
  res.status(201).json(newUser);
});

router.get('/auth', authService.authenticationMiddleware, async (req, res) => {
  res.status(200).end();
});

router.post('/sign-in', async (req, res) => {
  const userDAO: GenericDAO<User> = req.app.locals.userDAO;
  const filter: Partial<User> = { username: req.body.username };
  const errors: string[] = [];

  if (hasNotRequiredFields(req.body, ['username', 'password'], errors)) {
    res.status(400).json({ message: errors.join('\n') });
    return;
  }

  const user = await userDAO.findOne(filter);
  console.log(user);
  if (user && (await bcrypt.compare(req.body.password, user.password))) {
    authService.createAndSetToken({ id: user.id }, res);
    res.status(201).json(user);
  } else {
    authService.removeToken(res);
    res.status(401).json({ message: 'username or passwor invalid!' });
  }
});

router.delete('/sign-out', (req, res) => {
  authService.removeToken(res);
  res.status(200).end();
});

router.delete('/', authService.authenticationMiddleware, async (req, res) => {
  const userDAO: GenericDAO<User> = req.app.locals.userDAO;

  userDAO.delete(res.locals.user.id);

  authService.removeToken(res);
  res.status(200).end();
});

router.get('/new', authService.authenticationMiddleware, async (req, res) => {
  const userDAO: GenericDAO<User> = req.app.locals.userDAO;
  const filter: Partial<User> = { id: res.locals.user.id };
  const newUser = await userDAO.findOne(filter);
  filter.new = false;
  await userDAO.update(filter);
  res.json({ new: newUser?.new });
});

router.get('/rating', authService.authenticationMiddleware, async (req, res) => {
  const userDAO: GenericDAO<User> = req.app.locals.userDAO;
  const filter: Partial<User> = { id: res.locals.user.id };
  const newUser = await userDAO.findOne(filter);
  if (newUser && newUser.rating) {
    console.log(newUser.rating);
    res.json({ rating: newUser?.rating });
  } else {
    filter.rating = true;
    await userDAO.update(filter);
    res.json({ rating: false });
  }
});

function hasNotRequiredFields(object: { [key: string]: unknown }, requiredFields: string[], errors: string[]) {
  let hasErrors = false;
  requiredFields.forEach(fieldName => {
    if (!object[fieldName]) {
      errors.push(fieldName + ' can not be empty.');
      hasErrors = true;
    }
  });
  return hasErrors;
}
function createNumber() {
  const randomNumber = Math.floor(100000 + Math.random() * 900000); // Generiert eine Zufallszahl zwischen 100000 und 999999
  return randomNumber;
}

async function sendCode(userEmail: string, code: number) {
  transporter
    .sendMail({
      from: 'donotreply@fh-muenster.de',
      to: userEmail,
      subject: 'Reset your BigStocks password',
      text: `Dear user,

Please enter this code: ${code} to activate your account.

Best regards,
The FH Muenster Sweng Team`
    })
    .then(() => {
      console.log('Email sent');
    })
    .catch(error => {
      console.error('Error sending email:', error);
    });
}

export default router;
