/* Autor: Lakzan Nathan */

import { expect } from 'chai';
import config from './config.js';
import { Browser, BrowserContext, Page, chromium } from 'playwright';
import fetch from 'node-fetch';

describe('/users/sign-up', () => {
  let browser: Browser;
  let context: BrowserContext;
  let page: Page;

  before(async () => {
    browser = await chromium.launch(config.launchOptions);
  });
  beforeEach(async () => {
    context = await browser.newContext();
    page = await context.newPage();
    await page.goto(config.clientUrl('/users/sign-up'));
  });

  afterEach(async () => {
    await context.close();
  });

  describe('render sign-up', () => {
    it('should render the page correctly', async () => {
      await page.goto(config.clientUrl('/users/sign-up'));
      await page.fill('#username', 'testuser');
      await page.fill('#email', 'testuser@email.de');
      expect(page.getByRole('button', { name: 'Create Account' })).to.not.be.null;
      expect(page.getByRole('button', { name: 'Sign-In' })).to.not.be.null;
      expect(await page.textContent('app-header a')).to.equal('Sign-Up');
      expect(await page.textContent('#usernameLabel')).to.equal('Username');
      expect(await page.textContent('#emailLabel')).to.equal('E-Mail');
      expect(await page.textContent('p')).to.contain('Already registered?');
      await page.getByRole('button', { name: '?' }).click();
      expect(await page.textContent('h1')).to.contain('Username Constraints');
      console.log(await page.textContent('.constraints li'));
      expect(await page.textContent('.constraints li')).to.contains('4 to 32 characters');
      await page.getByRole('button', { name: 'Go it!' }).click();
    });
  });

  describe('sign-up process', () => {
    it('sign-up correctly', async () => {
      await page.goto(config.clientUrl('/users/sign-up'));
      await page.fill('#username', 'testuser1');
      await page.fill('#email', 'testuser1@email.de');
      await page.getByRole('button', { name: 'Create Account' }).click();
      const response = await page.waitForResponse('**/sign-up');
      expect(response.status()).to.equal(201);
      console.log(await response.allHeaders());
      const headerValue = await response.headerValue('set-cookie');
      const token = headerValue!.split(';')[0].trim().substring('jwt-token='.length);
      console.log(token);
      const response1 = await fetch('http://localhost:3000/api/users/', {
        method: 'DELETE',
        headers: { Cookie: `jwt-token=${token}` }
      });
      console.log(response1);
    });

    it('sign-up incorrectly username to short', async () => {
      await page.goto(config.clientUrl('/users/sign-up'));
      await page.fill('#username', 'tes');
      await page.fill('#email', 'testuser1@email.de');
      await page.getByRole('button', { name: 'Create Account' }).click();
      expect(page.getByText('Username must be valid')).to.not.be.null;
    });

    it('sign-up incorrectly invalid Email', async () => {
      await page.goto(config.clientUrl('/users/sign-up'));
      await page.fill('#username', 'testuser1');
      await page.fill('#email', 'testuser');
      await page.getByRole('button', { name: 'Create Account' }).click();
      expect(page.getByText('Email is required and must be valid')).to.not.be.null;
    });
  });
});
