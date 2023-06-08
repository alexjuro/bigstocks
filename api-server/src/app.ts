/* Autor: Lakzan Nathan */

import express, { Express } from 'express';
import cookieParser from 'cookie-parser';
import http from 'node:http';
import https from 'node:https';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import startDB from './db.js';
import { corsService } from './services/cors.service.js';
import { cspMiddleware } from './services/cspMiddleware.js';
import { hstsMiddleware } from './services/hstsMiddleware.js';
import { pathToFileURL } from 'node:url';
import users from './routes/users.js';
import account from './routes/account-management.js';
import mainPage from './routes/mainPage.js';
import trading from './routes/trading.js';
import transaction from './routes/transaction.js';
import friends from './routes/friends.js';
import leaderboard from './routes/leaderboard.js';
import minesweeper from './routes/minesweeper.js';
import config from '../config.json' assert { type: 'json' };
import comment from './routes/comment.js';
import { referrerPolicyMiddleware } from './services/referrerPolicyMiddleware.js';
import { xContentTypeMiddleware } from './services/xContentTypeMiddleware.js';
import { xFrameMiddleware } from './services/xFrameMiddleware.js';

function configureApp(app: Express) {
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json({ limit: 1024 * 200 }));
  app.use(cookieParser());
  app.use(corsService.corsMiddleware);
  app.use(cspMiddleware);
  app.use(hstsMiddleware);
  app.use(referrerPolicyMiddleware);
  app.use(xContentTypeMiddleware);
  app.use(xFrameMiddleware);
  app.use('/api/main', mainPage);
  app.use('/api/trading', trading);
  app.use('/api/users', users);
  app.use('/api/users/account', account);
  app.use('/api/users/transactions', transaction);
  app.use('/api/comment', comment);
  app.use('/api/friends', friends);
  app.use('/api/leaderboard', leaderboard);
  app.use('/api/minesweeper', minesweeper);
  // TODO: Routen einbinden
}

export async function start() {
  const app = express();

  configureApp(app);
  const stopDB = await startDB(app);
  const stopHttpServer = await startHttpServer(app, config.server.port);
  return async () => {
    await stopHttpServer();
    await stopDB();
  };
}

async function startHttpServer(app: Express, port: number) {
  const createOptions = () => {
    const basedir = fileURLToPath(path.dirname(import.meta.url));
    const certDir = path.join(basedir, 'certs');
    return {
      key: fs.readFileSync(path.join(certDir, 'server.key.pem')),
      cert: fs.readFileSync(path.join(certDir, 'server.cert.pem')),
      ca: fs.readFileSync(path.join(certDir, 'intermediate-ca.cert.pem'))
    };
  };
  const httpServer = config.server.https ? https.createServer(createOptions(), app) : http.createServer(app);
  await new Promise<void>(resolve => {
    httpServer.listen(port, () => {
      console.log(`Server running at http${config.server.https ? 's' : ''}://localhost:${port}`);
      resolve();
    });
  });
  return async () => await new Promise<void>(resolve => httpServer.close(() => resolve()));
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  start();
}
