/* Autor: Nico Pareigis */

import { Browser, BrowserContext, Page, chromium, Locator } from 'playwright';
import { expect } from 'chai';
import config from './config.js';
import fetch from 'node-fetch';

const user = {
  name: 'test',
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

  describe('avatar', () => {
    const sig = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

    it('should fail given an invalid file', async () => {
      await avatar
        .locator('input[type=file]')
        .setInputFiles({ name: 'index.html', mimeType: 'text/html', buffer: Buffer.from(sig) });

      const upload = await page.waitForSelector('user-profile-avatar #upload');
      expect(await upload.isVisible()).to.be.true;
      await upload.click();

      await page.waitForSelector('app-notification');
      expect(await page.getByText('Invalid file.').textContent()).to.not.be.null;
    });

    it('should succeed given a valid file', async () => {
      await page.route(config.serverUrl('/users/account/avatar'), route => route.fulfill({ status: 200 }));

      await avatar
        .locator('input[type=file]')
        .setInputFiles({ name: 'image.png', mimeType: 'image/png', buffer: Buffer.from(sig) });

      const upload = await page.waitForSelector('user-profile-avatar #upload');
      expect(await upload.isVisible()).to.be.true;
      await upload.click();

      await page.waitForSelector('app-notification');
      expect(await page.getByText('Avatar update successful.').textContent()).to.not.be.null;
    });
  });

  describe('details', () => {
    it('should fail given invalid details', async () => {
      await details.locator('input').nth(0).fill('invalid&name');
      await details.getByRole('button', { name: 'Save' }).click();

      expect(await details.locator('.invalid-feedback').nth(0).isVisible()).to.be.true;

      await details.locator('input').nth(1).fill('invalid&email');
      await details.getByRole('button', { name: 'Save' }).click();

      expect(await details.locator('.invalid-feedback').nth(1).isVisible()).to.be.true;
    });

    it('should succeed given valid details', async () => {
      await page.route(config.serverUrl('/users/account/details'), route => route.fulfill({ status: 200 }));

      await details.locator('input').nth(0).fill(`new${user.name}`);
      await details.locator('input').nth(1).fill(`new${user.email}`);
      await details.getByRole('button', { name: 'Save' }).click();
      expect(await details.locator('.invalid-feedback').nth(0).isVisible()).to.be.false;
      expect(await details.locator('.invalid-feedback').nth(1).isVisible()).to.be.false;

      await page.fill('dialog input', user.password);
      await page.getByText('Confirm', { exact: true }).click();

      await page.waitForSelector('app-notification');
      expect(await page.getByText('Profile update successful.').textContent()).to.not.be.null;
    });
  });

  describe('password', () => {
    it('should fail given invalid password', async () => {
      await password.locator('input').nth(0).fill('invalidpassword');
      await password.locator('input').nth(1).fill('invalidpassword');
      await password.getByRole('button', { name: 'Save' }).click();

      expect(await password.locator('.invalid-feedback').isVisible()).to.be.true;
    });

    it('should fail given mismatched passwords', async () => {
      await password.locator('input').nth(0).fill(`${user.password}1`);
      await password.locator('input').nth(1).fill(`${user.password}2`);
      await password.getByRole('button', { name: 'Save' }).click();

      await page.waitForSelector('app-notification');
    });

    it('should succeed given valid password', async () => {
      await page.route(config.clientUrl('/users/sign-in'), route => route.fulfill({ status: 200 }));
      await page.route(config.serverUrl('/users/account/password'), route => route.fulfill({ status: 200 }));

      await password.locator('input').nth(0).fill(`${user.password}1`);
      await password.locator('input').nth(1).fill(`${user.password}1`);
      await password.getByRole('button', { name: 'Save' }).click();
      expect(await password.locator('.invalid-feedback').isVisible()).to.be.false;

      await page.fill('dialog input', user.password);
      await page.getByText('Confirm', { exact: true }).click();

      await page.waitForURL(config.clientUrl('/users/sign-in'));
      expect(page.url()).to.equal(config.clientUrl('/users/sign-in'));
    });
  });
});
