/* Autor: Alexander Schellenberg */
import { expect } from 'chai';
import fetch from 'node-fetch';
import config from './config.js';

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

describe('/trading/details', () => {
  before(async () => (user.token = await signIn(user.name, user.password)));

  it('should retrieve user note', async () => {
    const res = await createFetch('GET', '/trading/details/AAPL');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const responseBody: any = await res.json();

    expect(res.status).to.equal(200);
    expect(responseBody.note.note).to.deep.equal('This is a test note');
  });

  it('should not post dangerous note', async () => {
    const requestBody = {
      note: {
        symbol: 'PPPP',
        note: '=//; SELECT * FROM users;'
      }
    };
    const res = await createFetch('POST', '/trading/details/', requestBody);
    const responseBody = (await res.json()) as Record<string, string>;

    expect(res.status).to.equal(403);
    expect(responseBody.error).to.deep.equal('Potential Attack detected');
  });

  it('should post note', async () => {
    const requestBody = {
      note: {
        symbol: 'PPPP',
        note: 'This is a test note'
      }
    };
    const res = await createFetch('POST', '/trading/details/', requestBody);
    const responseBody = (await res.json()) as Record<string, string>;

    expect(res.status).to.equal(200);
    expect(responseBody.message).to.deep.equal('Note saved successfully');
  });
});
