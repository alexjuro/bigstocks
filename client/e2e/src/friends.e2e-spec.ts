/* Autor: Alexander Lesnjak */

/*
import { Browser, BrowserContext, Page, chromium, Locator } from 'playwright';
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

describe('/profile', () => {
  let browser: Browser;
  let context: BrowserContext;
  let page: Page;
  let avatar: Locator;
  let details: Locator;
  let password: Locator;

  before(async () => {
    browser = await chromium.launch(config.launchOptions);
    context = await browser.newContext();
    page = await context.newPage();

    await signIn(context, user.name, user.password);

    await page.goto(config.clientUrl('/profile'));
    avatar = page.locator('user-profile-avatar');
    details = page.locator('user-profile-details');
    password = page.locator('user-profile-password');
  });

  after(async () => {
    await context.close();
    await browser.close();
  });

  describe('page', () => {
    it('should render the page correctly', async () => {
      expect(await page.textContent('app-header a')).to.equal('Profile');
      expect(await page.locator('user-profile h2').nth(0).textContent()).to.equal('Account');
      expect(await page.locator('user-profile h2').nth(1).textContent()).to.equal('Transactions');
      expect(await page.textContent('user-profile-avatar h3')).to.equal('Avatar');
      expect(await page.textContent('user-profile-details h3')).to.equal('General Information');
      expect(await page.textContent('user-profile-password h3')).to.equal('Password');
    });

    it('should fail given invalid password', async () => {
      await details.locator('#name').fill('abcd');
      await details.getByRole('button', { name: 'Save' }).click();
      await page.fill('dialog input', `${user.password}!`);
      await page.getByText('Confirm', { exact: true }).click();

      await page.waitForSelector('app-notification');
      expect(await page.getByText('Incorrect Password.').textContent()).to.not.be.null;
    });

    it('should succeed given valid password', async () => {
      await page.route(config.serverUrl('/users/account/details'), route => route.fulfill({ status: 200 }));

      await details.locator('#name').fill('abcd');
      await details.getByRole('button', { name: 'Save' }).click();
      await page.fill('dialog input', user.password);
      await page.getByText('Confirm', { exact: true }).click();

      await page.waitForSelector('app-notification');
      expect(await page.getByText('Profile update successful.').textContent()).to.not.be.null;
    });
  });
});*/
