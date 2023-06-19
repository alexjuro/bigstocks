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

describe('/leaderboard', () => {
  let browser: Browser;
  let context: BrowserContext;
  let page: Page;
  //   let userSession: UserSession;

  before(async () => {
    browser = await chromium.launch(config.launchOptions);
    context = await browser.newContext();
    page = await context.newPage();

    await signIn(context, user.name, user.password);

    await page.goto(config.clientUrl('/leaderboard'));
  });

  after(async () => {
    await context.close();
    await browser.close();
  });

  describe('render leaderboard', () => {
    it('should render the page correctly', async () => {
      expect(await page.textContent('#content')).to.not.be.null;
      expect(await page.textContent('#pagetitle')).to.not.be.null;
      expect(await page.textContent('#change')).to.not.be.null;
      expect(await page.textContent('#imagesflex')).to.not.be.null;
      expect(await page.textContent('#images')).to.not.be.null;
      expect(await page.textContent('#namesflex')).to.not.be.null;
      expect(await page.textContent('#placementsflex')).to.not.be.null;
      expect(await page.textContent('#placements')).to.not.be.null;
      expect(await page.textContent('#background')).to.not.be.null;

      expect(await page.textContent('#btnMinesweeper')).to.equal('need cash?');
    });
  });

  describe('show leaderboards', async () => {
    it('should switch to daytrading leaderboard profit', async () => {
      await page.getByText('daytrading profit', { exact: true }).click();

      const response = await page.waitForResponse('**/leaderboard/lastDay');
      expect(response.status()).to.equal(200);
    });

    it('should switch to back to last weeks profit', async () => {
      await page.getByText('last weeks profit', { exact: true }).click();

      const response = await page.waitForResponse('**/leaderboard/lastWeek');
      expect(response.status()).to.equal(200);
    });
  });
});
