/* Autor: Alexander Schellenberg */

import { Browser, BrowserContext, Page, chromium, Locator } from 'playwright';
import { expect } from 'chai';
import config from './config.js';

describe('/trading/details', () => {
  let browser: Browser;
  let context: BrowserContext;
  let page: Page;
  let stock: Locator;
  let form: Locator;
  let submitButton: Locator;

  before(async () => {
    browser = await chromium.launch(config.launchOptions);
    context = await browser.newContext();
    page = await context.newPage();

    await page.goto(config.clientUrl('/app/sign-in'));
    await page.fill('#username', 'test');
    await page.getByRole('button', { name: 'Next' }).click();
    await page.fill('#password', 'Password1');
    await page.getByRole('button', { name: 'Sign-In', exact: true }).click();
    await page.waitForURL(config.clientUrl('/news'));

    await page.goto(config.clientUrl('/trading/market'));
    await page.waitForSelector('app-stock');
    stock = page.locator('app-stock').first();
    const stockh2 = stock.locator('h2');
    await stockh2.click();
    const detailsButton = stock.locator('.stockdetails');

    await detailsButton.click();

    expect(await page.url()).to.include('/trading/details');
    form = await page.locator('form');
    submitButton = await form.locator('button[type="submit"]');
  });

  after(async () => {
    await context.close();
    await browser.close();
  });

  describe('trading-details page', () => {
    it('should render the page correctly', async () => {
      await page.waitForSelector('.stock', { timeout: 4000 });
      expect(await page.url()).to.include('/trading/details');
      expect(await page.locator('.stock').count()).to.equal(1);
      expect(await page.locator('p').count()).to.equal(8);
    });
  });

  describe('form tests', () => {
    it('should submit the form correctly', async () => {
      const textarea = await form.locator('textarea');
      await textarea.fill('This is a test note');

      await submitButton.click();

      await page.waitForNavigation();

      expect(await page.textContent('app-header a')).to.equal('Market');
    });

    it('should see the submitted test note', async () => {
      await page.waitForSelector('app-stock');
      stock = page.locator('app-stock').first();
      const stockh2 = stock.locator('h2');
      await stockh2.click();
      const detailsButton = stock.locator('.stockdetails');
      await detailsButton.click();

      expect(await page.url()).to.include('/trading/details');
      form = await page.locator('form');

      const textarea = await form.locator('textarea');

      await page.waitForTimeout(500);
      expect(await textarea.textContent()).to.equal('This is a test note');
    });

    it('should display form validation error', async () => {
      const textarea = await form.locator('textarea');
      await textarea.fill('{$gt: ""}');
      await submitButton.click();

      await page.waitForSelector('.error-validation');

      expect(await page.url()).to.include('/trading/details');
      expect(await form.getAttribute('class')).to.include('error-validation');
    });
  });
});
