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

describe('/trading/market', () => {
  before(async () => (user.token = await signIn(user.name, user.password)));

  it('should retrieve market stocks', async () => {
    const res = await createFetch('GET', '/trading/market');

    const responseBody = (await res.json()) as Res;

    expect(res.status).to.equal(200);
  });
});
