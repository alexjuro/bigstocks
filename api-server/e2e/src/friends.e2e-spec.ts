/* Autor: Alexander Lesnjak */

import { expect } from 'chai';
import fetch from 'node-fetch';
import config from './config.js';

const user = {
  id: '4c099ea7-b869-4445-89f5-eb32c535a6e6',
  name: 'test2',
  email: 'test@bigstocks.de',
  password: 'Password1',
  token: ''
};

const createFetch = async (method: string, url: string, body?: unknown) => {
  const reqOpt = {
    method: method,
    body: body ? JSON.stringify(body) : null,
    headers: { 'cookie': `jwt-token=${user.token}`, 'Content-Type': 'application/json' }
  };

  return await fetch(config.url(url), reqOpt);
};

const signIn = async (username: string, password: string) => {
  const res = await createFetch('POST', '/users/sign-in', { username, password });

  const cookie = res.headers.raw()['set-cookie'].find(cookie => cookie.startsWith('jwt-token'));
  if (!cookie) throw new Error('Failed to extract jwt-token');

  return cookie.split('=')[1].split(';')[0];
};

describe('/users/friends', () => {
  before(async () => (user.token = await signIn(user.name, user.password)));

  describe('add friend', () => {
    it('should find the friend in requests', async () => {
      const res = await createFetch('POST', '/friends', {
        username: 'PatrickBateman'
      });

      expect(res.status).to.equal(409);
    });

    it('should fail adding oneself', async () => {
      const res = await createFetch('POST', '/friends', {
        username: user.name
      });

      expect(res.status).to.equal(400);
    });

    it('should fail sending another request', async () => {
      const res = await createFetch('POST', '/friends', {
        username: 'Ryan'
      });

      expect(res.status).to.equal(406);
    });

    it('should not find the user', async () => {
      const res = await createFetch('POST', '/friends', {
        username: 'asfdhagsfva'
      });

      expect(res.status).to.equal(404);
    });

    it('should fail adding due to invalid username', async () => {
      const res = await createFetch('POST', '/friends', {
        username: 'asfd///hagsfva'
      });

      expect(res.status).to.equal(418);
    });
  });

  describe('manage friends and requests', () => {
    it('should accept PatrickBateman', async () => {
      const res = await createFetch('POST', '/friends/accept', {
        username: 'PatrickBateman'
      });

      expect(res.status).to.equal(200);
    });

    it('should not find accepted user that should be declined decline ', async () => {
      const res = await createFetch('POST', '/friends/accept', {
        username: 'asfdhagsfva'
      });

      expect(res.status).to.equal(404);
    });

    it('should fail accepting due to invalid username', async () => {
      const res = await createFetch('POST', '/friends/accept', {
        username: 'asfd///hagsfva'
      });

      expect(res.status).to.equal(418);
    });

    it('should decline PatrickBateman', async () => {
      const res = await createFetch('POST', '/friends/decline', {
        username: 'PatrickBateman'
      });

      expect(res.status).to.equal(200);
    });

    it('should fail declining due to invalid username', async () => {
      const res = await createFetch('POST', '/friends/decline', {
        username: 'asfd///hagsfva'
      });

      expect(res.status).to.equal(418);
    });

    it('should delete PatrickBateman', async () => {
      const res = await createFetch('POST', '/friends/delete', {
        username: 'PatrickBateman'
      });

      expect(res.status).to.equal(200);
    });

    it('should fail deleting due to invalid username', async () => {
      const res = await createFetch('POST', '/friends/delete', {
        username: 'asfd///hagsfva'
      });

      expect(res.status).to.equal(418);
    });
  });
});
