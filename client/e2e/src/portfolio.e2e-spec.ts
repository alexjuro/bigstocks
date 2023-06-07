/* Autor: Alexander Schellenberg */

import { Browser, BrowserContext, Page, chromium, Locator } from 'playwright';
import { expect } from 'chai';
import config from './config.js';

describe('/trading/portfolio', () => {
  let browser: Browser;
  let context: BrowserContext;
  let page: Page;
  let info: Locator;
  let candle: Locator;
  let stock: Locator;
  let sortButton: Locator;

  before(async () => {
    browser = await chromium.launch(config.launchOptions);
    context = await browser.newContext();
    page = await context.newPage();

    await page.goto(config.clientUrl('/app/sign-in'));
    await page.fill('#username', 'admin');
    await page.getByRole('button', { name: 'Next' }).click();
    await page.fill('#password', 'Password1');
    await page.getByRole('button', { name: 'Sign-In', exact: true }).click();
    await page.waitForURL(config.clientUrl('/news'));

    await page.goto(config.clientUrl('/trading/portfolio'));
    info = page.locator('app-trading-info');
    candle = page.locator('app-trading-candle');
    sortButton = await page.locator('#sort');
  });

  after(async () => {
    await context.close();
    await browser.close();
  });

  describe('portfolio page', () => {
    it('should render the page correctly', async () => {
      expect(await page.textContent('app-header a')).to.equal('Portfolio');
      expect(await page.locator('.graph-container h1').nth(0).textContent()).to.equal('Portfolio-Graph');
      expect(await page.locator('.graph-container h1').nth(1).textContent()).to.equal('Portfolio-Allocation');
      expect(await page.locator('.info-container h1').nth(0).textContent()).to.equal('Your Stocks');
      await page.waitForSelector('app-stock');
      expect(await page.locator('app-stock').count()).to.equal(4);
    });
  });

  describe('portfolio sort', () => {
    it('should sort stocks', async () => {
      await sortButton.click();
      expect((await sortButton.textContent()) == 'Sort Shares');
      let stockName = await page.locator('app-stock h2').first().textContent();
      expect(stockName).to.not.equal('Apple');

      await sortButton.click();
      expect((await sortButton.textContent()) == 'Sort Alphabetically');
      stockName = await page.locator('app-stock h2').first().textContent();
      expect(stockName).to.equal('Apple');
    });
  });

  describe('same trading activities', () => {
    it('should display stock information on click', async () => {
      stock = page.locator('app-stock').first();
      const stockh2 = stock.locator('h2');
      await stockh2.click();

      expect(await candle.isVisible()).to.be.true;
      expect(await info.isVisible()).to.be.true;

      const stockName = await stockh2.textContent();
      expect(stockName).to.equal('Apple');

      const price = await stock.locator('.prices').textContent();
      expect(price).to.not.equal('N/A');

      await stockh2.click();
      expect(await candle.isVisible()).to.be.false;
      expect(await info.isVisible()).to.be.false;
    });

    it('should execute buyStock function on Buy button click', async () => {
      expect(await info.isVisible()).to.not.be.true;
      const stockh2 = await stock.locator('h2');

      await stockh2.click();
      expect(await info.isVisible()).to.be.true;

      const buyButton = page.locator('.buy');
      await buyButton.click();

      await page.waitForSelector('.success', { timeout: 5000 });

      const sharesElement = await stock.locator('.shares').first();

      const sharesText = await sharesElement.textContent();

      expect(sharesText).to.equal('2x');
    });

    it('should execute sellStock function on Sell button click', async () => {
      const sellButton = page.locator('.sell');
      await sellButton.click();

      await page.waitForSelector('.warning', { timeout: 5000 });

      const sharesElement = await stock.locator('.shares').first();

      const sharesText = await sharesElement.textContent();

      expect(sharesText).to.equal('1x');
    });

    it('should navigate to details page on button click', async () => {
      const detailsButton = stock.locator('.stockdetails');

      await detailsButton.click();

      expect(await page.url()).to.include('/trading/details');
    });
  });

  describe('portfolio error', () => {
    it('should display an error notification when buying with insufficient funds', async () => {
      context = await browser.newContext();
      page = await context.newPage();

      await page.goto(config.clientUrl('/app/sign-in'));
      await page.fill('#username', 'error');
      await page.getByRole('button', { name: 'Next' }).click();
      await page.fill('#password', 'Error123!');
      await page.getByRole('button', { name: 'Sign-In', exact: true }).click();
      await page.waitForURL(config.clientUrl('/news'));

      await page.goto(config.clientUrl('/trading/portfolio'));
      info = page.locator('app-trading-info');
      candle = page.locator('app-trading-candle');
      stock = page.locator('app-stock').first();

      expect(await info.isVisible()).to.not.be.true;
      const stockh2 = await stock.locator('h2');

      await stockh2.click();
      expect(await info.isVisible()).to.be.true;

      const buyButton = page.locator('.buy');
      await buyButton.click();

      await page.waitForSelector('.error', { timeout: 5000 });
      const sharesElement = await stock.locator('.shares').first();

      const sharesText = await sharesElement.textContent();

      expect(sharesText).to.equal('1x');
    });
  });
});
