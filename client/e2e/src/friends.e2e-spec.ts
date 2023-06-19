/* Autor: Alexander Lesnjak */

import { Browser, BrowserContext, Page, chromium } from 'playwright';
import { expect } from 'chai';
import config from './config.js';
import fetch from 'node-fetch';

const user = {
  name: 'test2',
  email: 'test@bigstocks.com',
  password: 'Password1'
};

const signIn = async (context: BrowserContext, username: string, password: string) => {
  const res = await fetch(config.serverUrl('/users/sign-in'), {
    method: 'POST',
    body: JSON.stringify({ username, password }),
    headers: { 'Content-Type': 'application/json' }
  });

  const cookie = res.headers.raw()['set-cookie'].find(cookie => cookie.startsWith('jwt-token'));
  if (!cookie) throw new Error('Failed to extract jwt-token');
  const token = cookie.split('=')[1].split(';')[0];

  await context.addCookies([
    { name: 'jwt-token', value: token!, domain: new URL(config.serverUrl('')).hostname, path: '/' }
  ]);
};

describe('/users/friends', () => {
  let browser: Browser;
  let context: BrowserContext;
  let page: Page;
  //   let userSession: UserSession;

  before(async () => {
    browser = await chromium.launch(config.launchOptions);
    context = await browser.newContext();
    page = await context.newPage();

    await signIn(context, user.name, user.password);

    await page.goto(config.clientUrl('/users/friends'));
  });

  after(async () => {
    await context.close();
    await browser.close();
  });

  describe('render friends', () => {
    it('should render the page correctly', async () => {
      expect(await page.textContent('#background')).to.not.be.null;
      expect(await page.textContent('#main')).to.not.be.null;
      expect(await page.textContent('#addFriend button')).to.equal('Add friend');
      expect(await page.textContent('#friendsContainer')).to.not.be.null;
      expect(await page.textContent('#addMethod')).to.not.be.null;
      expect(await page.textContent('#addwindow')).to.not.be.null;
      expect(await page.textContent('#sendbtn')).to.equal('Send');

      expect(await page.textContent('#feedback')).to.not.be.null;

      expect(await page.textContent('#requestwindow')).to.not.be.null;
      expect(await page.textContent('#friendsList')).to.not.be.null;
      expect(await page.textContent('#friendswindow')).to.not.be.null;
    });
  });

  describe('add friend process', async () => {
    it('should fail adding yourself', async () => {
      await page.fill('#input', user.name);

      await page.getByText('Send', { exact: true }).click();

      const response = await page.waitForResponse('**/friends');
      expect(response.status()).to.equal(400);
    });

    it('should fail adding PatrickBateman', async () => {
      await page.fill('#input', 'PatrickBateman');

      await page.getByText('Send', { exact: true }).click();

      const response = await page.waitForResponse('**/friends');
      expect(response.status()).to.equal(409);
    });

    it('should fail adding User that does not exist', async () => {
      await page.fill('#input', 'asghyats7asg8');

      await page.getByText('Send', { exact: true }).click();

      const response = await page.waitForResponse('**/friends');
      expect(response.status()).to.equal(404);
    });

    it('should fail adding friend again', async () => {
      await page.fill('#input', 'axel');

      await page.getByText('Send', { exact: true }).click();

      const response = await page.waitForResponse('**/friends');
      expect(response.status()).to.equal(409);
    });
  });

  describe('maintain friends', async () => {
    it('should decline a request', async () => {
      await page.locator('#declineBtn').first().click();

      const response = await page.waitForResponse('**/friends/decline');
      expect(response.status()).to.equal(200);
    });

    it('should accept a request', async () => {
      await page.locator('#acceptBtn').first().click();

      const response = await page.waitForResponse('**/friends/accept');
      expect(response.status()).to.equal(200);
    });

    // it('should delete last accepted  a friend', async () => {
    //   page.on('dialog', async dialog => {
    //     await dialog.accept();
    //   });

    //   await page.locator('#deleteBtn').nth(2).click();

    //   const response = await page.waitForResponse('**/friends/delete');
    //   expect(response.status()).to.equal(200);
    // });
  });
});
