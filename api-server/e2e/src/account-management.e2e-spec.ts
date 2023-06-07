/* Autor: Nico Pareigis */

import { expect } from 'chai';
import fetch from 'node-fetch';
import config from './config.js';

type Res = { status: string };

const user = {
  id: '41b3ed0f-169d-447b-baf1-46eef5f82e72',
  name: 'test',
  email: 'test@bigstocks.com',
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

describe('/users/account', () => {
  before(async () => (user.token = await signIn(user.name, user.password)));

  after(async () => {
    await createFetch('POST', '/users/account/avatar', {
      id: user.id,
      avatar: ''
    });
    await createFetch('POST', '/users/account/details', {
      id: user.id,
      username: user.name,
      email: user.email
    });
    await createFetch('POST', '/users/account/password', {
      id: user.id,
      password: user.password
    });
  });

  describe('generic', () => {
    it('should reject with additional properties', async () => {
      const res = await createFetch('POST', '/users/account/avatar', {
        id: user.id,
        avatar: 'data:image/png;base64,imgdata',
        field: 'value'
      });

      expect(res.status).to.equal(400);
      expect(((await res.json()) as Res).status).to.equal('bad request');
    });

    it('should reject with missing properties', async () => {
      const res = await createFetch('POST', '/users/account/avatar', { id: user.id });

      expect(res.status).to.equal(400);
      expect(((await res.json()) as Res).status).to.equal('bad request');
    });

    it('should reject with incorrect property type', async () => {
      const res = await createFetch('POST', '/users/account/avatar', {
        id: user.id,
        avatar: 1
      });

      expect(res.status).to.equal(400);
      expect(((await res.json()) as Res).status).to.equal('bad request');
    });
  });

  describe('/avatar', () => {
    it('should reject invalid image string', async () => {
      const res = await createFetch('POST', '/users/account/avatar', {
        id: user.id,
        avatar: 'invalid-string-data'
      });

      expect(res.status).to.equal(400);
      expect(((await res.json()) as Res).status).to.equal('bad request');
    });

    it('should accept valid body', async () => {
      const res = await createFetch('POST', '/users/account/avatar', {
        id: user.id,
        avatar: 'data:image/png;base64,imgdata'
      });

      expect(res.status).to.equal(200);
      expect(((await res.json()) as Res).status).to.equal('ok');
    });
  });

  describe('/details', async () => {
    it('should reject invalid name', async () => {
      const res = await createFetch('POST', '/users/account/details', {
        id: user.id,
        username: 'abc',
        email: user.email
      });

      expect(res.status).to.equal(400);
      expect(((await res.json()) as Res).status).to.equal('bad request');
    });

    it('should reject invalid email', async () => {
      const res = await createFetch('POST', '/users/account/details', {
        id: user.id,
        username: user.name,
        email: 'invalid@email.'
      });

      expect(res.status).to.equal(400);
      expect(((await res.json()) as Res).status).to.equal('bad request');
    });

    it('should accept valid body', async () => {
      const res = await createFetch('POST', '/users/account/details', {
        id: user.id,
        username: user.name,
        email: 'testmail@bigstocks.com'
      });

      expect(res.status).to.equal(200);
      expect(((await res.json()) as Res).status).to.equal('ok');
    });
  });

  describe('/password', async () => {
    it('should reject invalid password', async () => {
      const res = await createFetch('POST', '/users/account/password', {
        id: user.id,
        password: 'invalidpassword'
      });

      expect(res.status).to.equal(400);
      expect(((await res.json()) as Res).status).to.equal('bad request');
    });

    it('should accept valid body', async () => {
      const res = await createFetch('POST', '/users/account/password', {
        id: user.id,
        password: 'ValidPassword1'
      });

      expect(res.status).to.equal(200);
      expect(((await res.json()) as Res).status).to.equal('ok');
    });
  });
});
