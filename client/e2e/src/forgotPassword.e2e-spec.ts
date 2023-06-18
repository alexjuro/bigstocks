/* Autor: Lakzan Nathan */

import { expect } from 'chai';
import config from './config.js';
import { Browser, BrowserContext, Page, chromium } from 'playwright';

describe('/users/forgotPassword', () => {
  let browser: Browser;
  let context: BrowserContext;
  let page: Page;

  before(async () => {
    browser = await chromium.launch(config.launchOptions);
  });
  beforeEach(async () => {
    context = await browser.newContext();
    page = await context.newPage();
    await page.goto(config.clientUrl('/users/forgotPassword'));
  });

  afterEach(async () => {
    await context.close();
  });

  describe('render forgotPassword', () => {
    it('should render the page correctly', async () => {
      await page.goto(config.clientUrl('/users/forgotPassword'));
      await page.fill('#username', 'testForgetPasswordUser');
      await page.fill('#safetyAnswerOne', 'pizza');
      expect(page.getByRole('button', { name: 'Reset Password' })).to.not.be.null;
      expect(await page.textContent('app-header a')).to.equal('Forgot Password');
      expect(await page.textContent('label')).to.equal('Username');
      expect(await page.getByText('What is your favorite food?')).to.not.be.null;
      expect(await page.textContent('h1')).to.contain('Forgot Password');
    });
  });

  it('forgetPassword incorrectly username to short', async () => {
    await page.goto(config.clientUrl('/users/forgotPassword'));
    await page.fill('#username', 'tes');
    await page.getByRole('button', { name: 'Reset Password' }).click();
    expect(page.getByText('Username is required')).to.not.be.null;
  });

  it('answer to short', async () => {
    await page.goto(config.clientUrl('/users/forgotPassword'));
    await page.fill('#username', 'testForgetPasswordUser');
    await page.fill('#safetyAnswerOne', 'piz');
    await page.getByRole('button', { name: 'Reset Password' }).click();
    expect(page.getByText('Entering a answer is mandatory')).to.not.be.null;
  });

  it('forgot incorrectly', async () => {
    await page.goto(config.clientUrl('/users/forgotPassword'));
    await page.fill('#username', 'testForgetPasswordUser');
    await page.fill('#safetyAnswerOne', 'pizzasaa');
    await page.getByRole('button', { name: 'Reset Password' }).click();
    const response = await page.waitForResponse('**/forgotPassword');
    expect(response.status()).to.equal(401);
  });

  describe('forgotPassword process', () => {
    it('forgot correctly', async () => {
      await page.goto(config.clientUrl('/users/forgotPassword'));
      await page.fill('#username', 'testForgetPasswordUser');
      await page.fill('#safetyAnswerOne', 'pizza');
      await page.getByRole('button', { name: 'Reset Password' }).click();
      const response = await page.waitForResponse('**/forgotPassword');
      expect(response.status()).to.equal(201);
    });
  });
});
