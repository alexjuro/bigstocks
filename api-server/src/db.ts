/* Autor: Prof. Dr. Norman Lahme-Hütig (FH Münster) */

import mongodb from 'mongodb';
import pg from 'pg';
import { Express } from 'express';
import { MongoGenericDAO } from './models/mongo-generic.dao.js';
import { PsqlGenericDAO } from './models/psql-generic.dao.js';
import { InMemoryGenericDAO } from './models/in-memory-generic.dao.js';
import config from '../config.json' assert { type: 'json' };
import { User } from './models/user.js';
import { Stock } from './models/stock.js';
import { Transaction } from './models/transaction.js';
import { Note } from './models/note.js';
import { Comment } from './models/comment.js';
const { MongoClient } = mongodb;
const { Client } = pg;

export default async function startDB(app: Express) {
  switch (config.db.use) {
    case 'mongodb':
      return await startMongoDB(app);
    case 'psql':
      return await startPsql(app);
    default:
      return await startInMemoryDB(app);
  }
}

async function startInMemoryDB(app: Express) {
  app.locals.stockDAO = new InMemoryGenericDAO<Stock>();
  app.locals.transactionDAO = new InMemoryGenericDAO<Transaction>();
  app.locals.userDAO = new InMemoryGenericDAO<User>();
  app.locals.noteDAO = new InMemoryGenericDAO<Note>();
  return async () => Promise.resolve();
}

async function startMongoDB(app: Express) {
  const client = await connectToMongoDB();
  const db = client.db('bigstocks');
  //app.locals.userDAO = new MongoGenericDAO<User>(db, 'users');
  app.locals.userDAO = new MongoGenericDAO<User>(db, 'users');
  app.locals.stockDAO = new MongoGenericDAO<Stock>(db, 'stocks');
  app.locals.transactionDAO = new MongoGenericDAO<Transaction>(db, 'transactions');
  app.locals.noteDAO = new MongoGenericDAO<Note>(db, 'notes');
  app.locals.commentDAO = new MongoGenericDAO<Comment>(db, 'comments');

  // TODO: DAOs erzeugen
  return async () => await client.close();
}

async function connectToMongoDB() {
  const url = `mongodb://${config.db.connect.host}:${config.db.connect.port.mongodb}`;
  const client = new MongoClient(url, {
    auth: { username: config.db.connect.user, password: config.db.connect.password },
    authSource: config.db.connect.database
  });
  try {
    await client.connect();
  } catch (err) {
    console.log('Could not connect to MongoDB: ', err);
    process.exit(1);
  }
  return client;
}

async function startPsql(app: Express) {
  const client = await connectToPsql();
  app.locals.transactionDAO = new PsqlGenericDAO<Transaction>(client!, 'transactions');
  app.locals.stockkDAO = new PsqlGenericDAO<Stock>(client!, 'stocks');
  app.locals.userDAO = new PsqlGenericDAO<User>(client, 'users');
  app.locals.noteDAO = new PsqlGenericDAO<Note>(client, 'notes');
  return async () => await client.end();
}

async function connectToPsql() {
  const client = new Client({
    user: config.db.connect.user,
    host: config.db.connect.host,
    database: config.db.connect.database,
    password: config.db.connect.password,
    port: config.db.connect.port.psql
  });

  try {
    await client.connect();
    return client;
  } catch (err) {
    console.log('Could not connect to PostgreSQL: ', err);
    process.exit(1);
  }
}
