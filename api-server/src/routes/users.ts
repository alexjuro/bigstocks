/* Autor: Lakzan Nathan */
import express from 'express';
import bcrypt from 'bcryptjs';
import { GenericDAO } from '../models/generic.dao.js';
import { User } from '../models/user.js';
import { authService } from '../services/auth.service.js';
import nodemailer from 'nodemailer';

const router = express.Router();
const transporter = nodemailer.createTransport({
  host: 'mail.fh-muenster.de',
  port: 25
});

router.post('/activation', authService.authenticationMiddlewareActivation, async (req, res) => {
  const userDAO: GenericDAO<User> = req.app.locals.userDAO;
  const errors: string[] = [];
  if (!res.locals.user) {
    // Token nicht gesetzt oder ungültig
    res.status(401).json({ message: 'Unauthorized!' });
    return;
  }
  console.log('post /activation');
  console.log(res.locals.user);
  console.log(Math.floor(Date.now() / 1000) - res.locals.user.exp);
  if (res.locals.user.exp < Math.floor(Date.now() / 1000)) {
    const result = await userDAO.delete(req.body.id);
    console.log(result);
    authService.removeToken(res);
    res.status(401).json({ message: 'Token expired!' });
    return;
  }

  const sendErrMsg = (message: string) => {
    console.log(message);
    res.status(400).json({ message });
  };
  if (
    hasNotRequiredFields(req.body, ['code', 'password', 'passwordCheck', 'safetyAnswerOne', 'safetyAnswerTwo'], errors)
  ) {
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
  console.log(req.body.password);
  filter.password = await bcrypt.hash(req.body.password, 10);
  console.log(req.body.safeteyAnswerOne);
  filter.safetyAnswerOne = await bcrypt.hash(req.body.safetyAnswerOne, 10);
  filter.safetyAnswerTwo = await bcrypt.hash(req.body.safetyAnswerTwo, 10);

  await userDAO.update(filter);
  authService.createAndSetToken({ id: res.locals.user.id }, res);
  res.status(201).json(user);
});

router.post('/forgotPassword', async (req, res) => {
  const userDAO: GenericDAO<User> = req.app.locals.userDAO;
  const errors: string[] = [];

  const sendErrMsg = (message: string) => {
    authService.removeToken(res);
    res.status(400).json({ message });
  };

  if (hasNotRequiredFields(req.body, ['username', 'safetyAnswerOne'], errors)) {
    return sendErrMsg(errors.join('\n'));
  }
  const filter: Partial<User> = { username: req.body.username };
  filter.username = filter.username?.toUpperCase();
  const user = await userDAO.findOne(filter);
  if (user && (await bcrypt.compare(req.body.safetyAnswerOne, user.safetyAnswerOne))) {
    authService.createAndSetShortToken({ id: user.id }, res);
    const code = createNumber();
    user.code = code;
    await userDAO.update(user);
    await sendCode(user.email, code);
    res.status(201).json(user);
  } else {
    authService.removeToken(res);
    res.status(401).json({ message: 'Invalid input!' });
  }
});

router.post('/resetPassword', authService.authenticationMiddlewareActivation, async (req, res) => {
  const userDAO: GenericDAO<User> = req.app.locals.userDAO;
  const errors: string[] = [];
  const sendErrMsg = (message: string) => {
    authService.removeToken(res);
    res.status(400).json({ message });
  };
  if (!res.locals.user) {
    // Token nicht gesetzt oder ungültig
    res.status(401).json({ message: 'Unauthorized!' });
    return;
  }

  console.log('post /resetPasswrd');
  console.log(res.locals.user);
  console.log(Math.floor(Date.now() / 1000) - res.locals.user.exp);
  if (res.locals.user.exp < Math.floor(Date.now() / 1000)) {
    const result = await userDAO.delete(req.body.id);
    console.log(result);
    authService.removeToken(res);
    res.status(401).json({ message: 'Token has expired!' });
    return;
  }
  const filter: Partial<User> = { id: res.locals.user.id };
  const user = await userDAO.findOne(filter);
  if (hasNotRequiredFields(req.body, ['code', 'password', 'passwordCheck', 'safetyAnswerTwo'], errors)) {
    return sendErrMsg(errors.join('\n'));
  }
  if (req.body.password !== req.body.passwordCheck) {
    console.log(req.body.password + ' ' + req.body.passwordCheck);
    return sendErrMsg('The two passwords do not match.');
  }

  if (parseInt(req.body.code) !== user?.code) {
    console.log(req.body.code);
    console.log(user?.code);
    return sendErrMsg('invalid code!');
  }
  if (!(await bcrypt.compare(req.body.safetyAnswerTwo, user.safetyAnswerTwo))) {
    // authService.removeToken(res);
    return sendErrMsg('Invalid Input!');
  }

  filter.code = 0;
  filter.password = await bcrypt.hash(req.body.password, 10);
  filter.safetyAnswerTwo = await bcrypt.hash(req.body.safetyAnswerTwo, 10);

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

  if (hasNotRequiredFields(req.body, ['email', 'username'], errors)) {
    return sendErrMsg(errors.join('\n'));
  }
  const filter: Partial<User> = { email: req.body.email };
  filter.email = filter.email?.toUpperCase();
  if (await userDAO.findOne(filter)) {
    return sendErrMsg('Invalid Input');
  }

  const filter2: Partial<User> = { username: req.body.username };
  filter2.username = filter2.username?.toUpperCase();
  if (await userDAO.findOne(filter2)) {
    return sendErrMsg('Invalid Input');
  }

  const newCode = createNumber();
  const newUser = await userDAO.create({
    username: req.body.username.toUpperCase(),
    email: req.body.email.toUpperCase(),
    password: 'wait for activation',
    safetyAnswerOne: 'wait for activation',
    safetyAnswerTwo: 'wait for activation',
    activation: false,
    code: newCode,
    new: true,
    rating: false
  });
  await sendCodeActivation(newUser.email, newCode);
  authService.createAndSetShortToken({ id: newUser.id }, res);
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

  filter.username = filter.username?.toUpperCase();

  const user = await userDAO.findOne(filter);
  if (user && (await bcrypt.compare(req.body.password, user.password))) {
    authService.createAndSetToken({ id: user.id }, res);
    res.status(201).json(user);
  } else {
    authService.removeToken(res);
    res.status(401).json({ message: 'Invalid Input!' });
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
  const status = newUser?.new;
  filter.new = false;
  await userDAO.update(filter);
  console.log('User status:' + newUser?.new);
  res.json({ new: status });
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

async function sendCodeActivation(userEmail: string, code: number) {
  transporter
    .sendMail({
      from: 'donotreply@fh-muenster.de',
      to: userEmail,
      subject: 'Activate your BigStocks account',
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
