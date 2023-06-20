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

describe('/minesweeper', () => {
  let browser: Browser;
  let context: BrowserContext;
  let page: Page;
  //   let userSession: UserSession;

  before(async () => {
    browser = await chromium.launch(config.launchOptions);
    context = await browser.newContext();
    page = await context.newPage();

    await signIn(context, user.name, user.password);

    await page.goto(config.clientUrl('/minesweeper'));
  });

  after(async () => {
    await context.close();
    await browser.close();
  });

  describe('render minesweeper', () => {
    it('should render the page correctly', async () => {
      expect(await page.textContent('#container')).to.not.be.null;
      expect(await page.textContent('#username')).to.not.be.null;
      expect(await page.textContent('#cash')).to.not.be.null;
      expect(await page.textContent('#tries')).to.not.be.null;
      expect(await page.textContent('#marksleft')).to.not.be.null;
      expect(await page.textContent('#how')).to.not.be.null;

      expect(await page.textContent('#restart-button')).to.equal('Restart');
    });
  });

  it('should play until game over and decrease the tries left by one or stay at 0', async () => {
    await page.getByText('test2', { exact: true });
    const triesString = await page.textContent('#tries');

    if (triesString == 'Tries left: 0') {
      throw new Error('no tries left');
    }

    const board = await page.waitForSelector('.board');
    const cells = await board.$$('.cell');

    for (const cell of cells) {
      await cell.click();
      const gameOverText = await page.textContent('#message');
      if (gameOverText === 'Game Over') {
        break;
      }
    }

    const response = await page.waitForResponse('**/minesweeper/restart');
    expect(response.status()).to.equal(200);
  });
});
