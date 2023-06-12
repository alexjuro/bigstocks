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

describe('/trading/market', () => {
  before(async () => (user.token = await signIn(user.name, user.password)));

  it('should retrieve market stocks', async () => {
    const res = await createFetch('GET', '/trading/market');

    const responseBody = (await res.json()) as Record<string, string>;

    expect(res.status).to.equal(200);
    expect(responseBody.results.length).to.equal(24);
  });

  it('should purchase a stock', async () => {
    const requestBody = {
      symbol: 'AAPL',
      name: 'Apple Inc.',
      image: 'https://example.com/apple.png',
      bPrice: 50.5,
      pValue: 500.0
    };

    const res = await createFetch('POST', '/trading', requestBody);

    const responseBody = (await res.json()) as Record<string, string>;

    expect(res.status).to.equal(201);
    expect(responseBody.transaction).to.be.an('object');
    expect(responseBody.money).to.be.a('number');
    expect(responseBody.performance).to.be.an('array');
  });

  it('should not purchase unknown stock', async () => {
    const requestBody = {
      symbol: 'PPPP',
      name: 'Apple',
      image: 'https://example.com/apfadfae.png',
      bPrice: 50.5,
      pValue: 500.0
    };

    const res = await createFetch('POST', '/trading', requestBody);

    const responseBody = (await res.json()) as Record<string, string>;

    expect(res.status).to.equal(404);
    expect(responseBody.error).to.deep.equal('Stock not found');
  });

  it('should not purchase stock with insufficient funds', async () => {
    const requestBody = {
      symbol: 'AAPL',
      name: 'Apple',
      image: 'https://example.com/apfadfae.png',
      bPrice: 8900.5,
      pValue: 500.0
    };

    const res = await createFetch('POST', '/trading', requestBody);

    const responseBody = (await res.json()) as Record<string, string>;

    expect(res.status).to.equal(400);
    expect(responseBody.error).to.deep.equal('Insufficient funds');
  });

  it('should not purchase stock with missing values', async () => {
    const requestBody = {
      symbol: 'AAPL',
      image: 'https://example.com/apfadfae.png',
      bPrice: 10.5,
      pValue: 500.0
    };

    const res = await createFetch('POST', '/trading', requestBody);

    const responseBody = (await res.json()) as Record<string, string>;

    expect(res.status).to.equal(400);
    expect(responseBody.message).to.deep.equal('name can not be empty');
  });

  it('should sell a stock', async () => {
    const requestBody = {
      symbol: 'AAPL',
      sPrice: 50.5,
      pValue: 500.0
    };

    const res = await createFetch('PATCH', '/trading', requestBody);

    const responseBody = (await res.json()) as Record<string, string>;

    expect(res.status).to.equal(200);
    expect(responseBody.message).to.deep.equal('Transaction updated successfully');
    expect(responseBody.money).to.be.a('number');
    expect(responseBody.performance).to.be.an('array');
  });

  it('should not be able to sell a stock without shares', async () => {
    const requestBody = {
      symbol: 'TSLA',
      sPrice: 50.5,
      pValue: 500.0
    };

    const res = await createFetch('PATCH', '/trading', requestBody);

    const responseBody = (await res.json()) as Record<string, string>;

    expect(res.status).to.equal(404);
    expect(responseBody.error).to.deep.equal('No active transactions found for the specified stock symbol');
  });
});
