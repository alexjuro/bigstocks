/* Autor: Lakzan Nathan */

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

describe('users/sign-in', () => {
  before(() => {
    config.activateTestProfile();
  });
  after(() => {
    config.deactivateTestProfile();
  });
  it('successfull sign-in', async () => {
    const res = await createFetch('POST', '/users/sign-in', { username: user.name, password: user.password });
    const cookie = res.headers.raw()['set-cookie'].find(cookie => cookie.startsWith('jwt-token'));
    expect(cookie).to.not.be.null;
    expect(res.status).to.equal(200);
    if (!cookie) throw new Error('Failed to extract jwt-token');
  });

  it('wrong password sign-in', async () => {
    const res = await createFetch('POST', '/users/sign-in', { username: user.name, password: user.password + 'wrong' });
    const cookie = res.headers.raw()['set-cookie'].find(cookie => cookie.startsWith('jwt-token'));
    expect(res.status).to.equal(401);
    if (!cookie) throw new Error('Failed to extract jwt-token');
  });

  it('invalid Username (to short) sign-in', async () => {
    const res = await createFetch('POST', '/users/sign-in', { username: 'as', password: user.password + 'wrong' });
    expect(res.status).to.equal(400);
  });

  it('invalid Password (does not comply with our constraints) sign-in', async () => {
    const res = await createFetch('POST', '/users/sign-in', { username: user.name, password: 'short' });
    expect(res.status).to.equal(400);
  });
});

describe('users/forgotPassword', () => {
  before(() => {
    config.activateTestProfile();
  });
  after(() => {
    config.deactivateTestProfile();
  });
  it('false Parameters', async () => {
    const res = await createFetch('POST', '/users/forgotPassword', {
      username: 'testForgetPasswordUser',
      password: 'pizza'
    });
    expect(res.status).to.equal(400);
  });

  it('correct Parameters', async () => {
    const res = await createFetch('POST', '/users/forgotPassword', {
      username: 'testForgetPasswordUser',
      safetyAnswerOne: 'pizza'
    });
    const cookie = res.headers.raw()['set-cookie'].find(cookie => cookie.startsWith('jwt-token'));
    expect(res.status).to.equal(201);
    expect(cookie).to.not.be.null;
  });

  it('reset Password without forgotPassword ', async () => {
    const res = await createFetch('POST', 'users/activation', {
      code: '123456',
      password: 'password1',
      passwordCheck: 'password1',
      safetyAnswerOne: 'this.safetyAnswerOne.value',
      safetyAnswerTwo: 'this.safetyAnswerTwo.value'
    });
    expect(res.status).to.equal(401);
    //validation Exception wird geworfen --> ist gewollt
  });
});
