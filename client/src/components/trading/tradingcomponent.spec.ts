/* Autor: Alexander Schellenberg */
import { TradingComponent } from './tradingcomponent';
import { assert, expect } from 'chai';
import { fake, SinonFakeTimers } from 'sinon';
import sinon, { SinonStubbedInstance } from 'sinon';
import { LitElement } from 'lit';
import { fixture, nextFrame } from '@open-wc/testing-helpers';
import { UserStock } from '../../interfaces/stock-interface';
import { MarketComponent } from './market/market';
import { StockService } from '../../stock-service';
import { PortfolioComponent } from './portfolio/portfolio';
import { router } from '../../router/router';
import { httpClient } from '../../http-client';

describe('TradingComponent', () => {
  let tradingComponent: MarketComponent; //da abstrakte Klasse
  let portfolioComponent: PortfolioComponent;
  let marketComponent: MarketComponent;
  let stocks: UserStock[];

  beforeEach(() => {
    stocks = [
      { symbol: 'AAPL', name: 'Apple', image: 'aplimage', shares: 4, price: 150, dailyPercentage: 2.5 },
      { symbol: 'MSFT', name: 'Microsoft', image: 'msftimage', shares: 2, price: 300, dailyPercentage: -1.8 }
    ];
    tradingComponent = new MarketComponent();
  });

  it('should initialize with default values', () => {
    expect(tradingComponent.userStocks).deep.equal([]);
    expect(tradingComponent.stockService).deep.equal(new StockService()); // cuz MarketComponent initialisiert mit StockService
    expect(tradingComponent.stockCandle).deep.equal(null);
    expect(tradingComponent.money).deep.equal(0);
    expect(tradingComponent.publicUrl).deep.equal('./../../../../public/');
  });

  it('should return the correct amount of money', () => {
    tradingComponent.money = 1000;
    expect(tradingComponent.getMoney()).deep.equal(1000);
  });

  it('should return the user stocks', () => {
    tradingComponent.userStocks = stocks;
    expect(tradingComponent.getStocks()).deep.equal([stocks[0], stocks[1]]);
  });

  it('should return the stock symbols', () => {
    tradingComponent.userStocks = stocks;
    expect(tradingComponent.getStockSymbols()).deep.equal(['AAPL', 'MSFT']);
  });

  it('should return the stock names', () => {
    tradingComponent.userStocks = stocks;
    expect(tradingComponent.getStockNames()).deep.equal(['Apple', 'Microsoft']);
  });

  it('should subscribe to stock symbols', () => {
    const subscribeSpy = sinon.spy(tradingComponent.stockService, 'subscribe');
    tradingComponent.userStocks = stocks;
    tradingComponent.sendSubscriptions();
    expect(subscribeSpy.calledWithExactly('AAPL')).to.be.true;
    expect(subscribeSpy.calledWithExactly('MSFT')).to.be.true;
  });

  it('should update stock price and apply CSS class changes', async () => {
    const stockSymbolApple = 'AAPL';
    const updatedPriceApple = 160;
    const stockSymbolMs = 'MSFT';
    const updatedPriceMs = 160;
    portfolioComponent = (await fixture('<app-portfolio></app-portfolio>')) as PortfolioComponent;
    await portfolioComponent.updateComplete;

    portfolioComponent.userStocks = stocks;

    portfolioComponent.requestUpdate();
    await portfolioComponent.updateComplete;

    const targetElementApple = portfolioComponent.shadowRoot!.querySelector(`#dot${stockSymbolApple}`);
    const targetElementMs = portfolioComponent.shadowRoot!.querySelector(`#dot${stockSymbolMs}`);

    expect(targetElementApple).to.exist;
    expect(targetElementMs).to.exist;

    portfolioComponent.updateStockPrice(stockSymbolApple, updatedPriceApple);
    portfolioComponent.updateStockPrice(stockSymbolMs, updatedPriceMs);

    expect(portfolioComponent.userStocks[0].price).to.equal(updatedPriceApple);
    expect(targetElementApple!.classList.contains('blinkGreen')).to.be.true;
    expect(targetElementMs!.classList.contains('blinkRed')).to.be.true;
  });

  it('should update stock daily percentage and apply CSS class changes', async () => {
    marketComponent = (await fixture('<app-market></app-market>')) as MarketComponent;
    marketComponent.userStocks = stocks;
    marketComponent.requestUpdate();
    await marketComponent.updateComplete;
    const stockSymbol = 'AAPL';
    const updatedPercentage = 1.2;
    const targetElement = marketComponent.shadowRoot!.querySelector(`#perc${stockSymbol}`);

    marketComponent.updateStockDailyPercentage(stockSymbol, updatedPercentage);

    expect(marketComponent.userStocks[0].dailyPercentage).to.equal(updatedPercentage);
    expect(targetElement!.classList.contains('setTextGreen')).to.be.true;
  });

  it('should return the correct timestamps', async () => {
    marketComponent = (await fixture('<app-market></app-market>')) as MarketComponent;
    marketComponent.userStocks = stocks;
    marketComponent.requestUpdate();
    await marketComponent.updateComplete;
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const currentDate = now.getDate();

    const expectedResultD = {
      timestamp: Math.floor(new Date(currentYear, currentMonth, currentDate - 6).getTime() / 1000).toString(),
      now: Math.floor(now.getTime() / 1000).toString()
    };

    const expectedResultM = {
      timestamp: Math.floor(new Date(currentYear, currentMonth - 6, currentDate).getTime() / 1000).toString(),
      now: Math.floor(now.getTime() / 1000).toString()
    };

    const expectedResultY = {
      timestamp: Math.floor(new Date(currentYear - 6, currentMonth, currentDate).getTime() / 1000).toString(),
      now: Math.floor(now.getTime() / 1000).toString()
    };

    const resultD = marketComponent.unixTimestamp('D');
    const resultM = marketComponent.unixTimestamp('M');
    const resultY = marketComponent.unixTimestamp('Y');

    expect(resultD).to.deep.equal(expectedResultD);
    expect(resultM).to.deep.equal(expectedResultM);
    expect(resultY).to.deep.equal(expectedResultY);
  });

  it('should add candle and info divs when they do not exist', async () => {
    marketComponent = (await fixture('<app-market></app-market>')) as MarketComponent;
    marketComponent.userStocks = stocks;
    marketComponent.requestUpdate();
    await marketComponent.updateComplete;

    const stockDiv = marketComponent.shadowRoot!.querySelector('.stock');
    const candleDiv = marketComponent.shadowRoot!.querySelector('.candle-div');
    const infoDiv = marketComponent.shadowRoot!.querySelector('.info-div');

    expect(candleDiv).to.be.null;
    expect(infoDiv).to.be.null;

    stockDiv?.dispatchEvent(new MouseEvent('click'));

    const updatedCandleDiv = marketComponent.shadowRoot!.querySelector('.candle-div');
    const updatedInfoDiv = marketComponent.shadowRoot!.querySelector('.info-div');
    const buyButton = marketComponent.shadowRoot!.querySelector('.buy');
    const sellButton = marketComponent.shadowRoot!.querySelector('.sell');
    const detailButton = marketComponent.shadowRoot!.querySelector('.stockdetails');

    expect(updatedCandleDiv).to.not.be.null;
    expect(updatedInfoDiv).to.not.be.null;
    expect(buyButton).to.not.be.null;
    expect(sellButton).to.not.be.null;
    expect(detailButton).to.not.be.null;

    const buyButtonClickSpy = sinon.spy(marketComponent, 'buyStock');
    const sellButtonClickSpy = sinon.spy(marketComponent, 'sellStock');
    const detailButtonClickSpy = sinon.spy(router, 'navigate');

    buyButton?.dispatchEvent(new MouseEvent('click'));
    sellButton?.dispatchEvent(new MouseEvent('click'));
    detailButton?.dispatchEvent(new MouseEvent('click'));

    expect(buyButtonClickSpy.calledOnce).to.be.true;
    expect(sellButtonClickSpy.calledOnce).to.be.true;
    expect(detailButtonClickSpy.calledOnce).to.be.true;

    buyButtonClickSpy.restore();
    sellButtonClickSpy.restore();
    detailButtonClickSpy.restore();
  });

  it('should remove candle and info divs when they do exist', async () => {
    marketComponent = (await fixture('<app-market></app-market>')) as MarketComponent;
    marketComponent.userStocks = stocks;
    marketComponent.requestUpdate();
    await marketComponent.updateComplete;

    const stockDiv = marketComponent.shadowRoot!.querySelector('.stock');
    let candleDiv = marketComponent.shadowRoot!.querySelector('.candle-div');
    let infoDiv = marketComponent.shadowRoot!.querySelector('.info-div');

    expect(candleDiv).to.be.null;
    expect(infoDiv).to.be.null;

    stockDiv?.dispatchEvent(new MouseEvent('click'));

    candleDiv = marketComponent.shadowRoot!.querySelector('.candle-div');
    infoDiv = marketComponent.shadowRoot!.querySelector('.info-div');

    expect(candleDiv).to.not.be.null;
    expect(infoDiv).to.not.be.null;

    stockDiv?.dispatchEvent(new MouseEvent('click'));

    candleDiv = marketComponent.shadowRoot!.querySelector('.candle-div');
    infoDiv = marketComponent.shadowRoot!.querySelector('.info-div');

    expect(candleDiv).to.be.null;
    expect(infoDiv).to.be.null;
  });

  it('should create stock candles chart', async () => {
    marketComponent = (await fixture('<app-market></app-market>')) as MarketComponent;

    const canvasElement = document.createElement('canvas');
    const symbol = 'AAPL';
    const intervall = 'M';

    const data = [100, 150, 200, 180, 220, 250];
    const getStockCandlesMock = sinon.stub(marketComponent.stockService!, 'getStockCandles').resolves(data);

    await marketComponent.createStockCandles(canvasElement, symbol, intervall);

    const chart: any = marketComponent.stockCandle;
    expect(chart).to.not.be.null;
    expect(chart?.config.type).to.equal('line');
    expect(chart?.data.datasets[0].data).to.deep.equal(data);
    expect(chart?.options.scales.y.grid.display).to.be.false;
    expect(chart?.options.scales.x.grid.display).to.be.false;

    getStockCandlesMock.restore();
  });

  it('should buy stock and update state correctly', async () => {
    marketComponent = (await fixture('<app-market></app-market>')) as MarketComponent;
    const getFirstDataMock = sinon
      .stub(marketComponent.stockService!, 'getFirstData')
      .resolves({ price: 250, percentage: 5 });

    const responseMock = {
      status: 201,
      json: () => Promise.resolve({ money: 4750 })
    };
    const postStub = sinon.stub(httpClient, 'post').resolves(responseMock as Response);

    const stock: UserStock = {
      symbol: 'AAPL',
      name: 'Apple Inc.',
      image: 'apple.png',
      shares: 0,
      price: 140,
      dailyPercentage: 2.5
    };

    marketComponent.money = 5000;

    await marketComponent.buyStock(new Event('click'), stock);

    expect(getFirstDataMock.calledOnceWithExactly(stock.symbol)).to.be.true;
    expect(
      postStub.calledOnceWithExactly('/trading/', {
        symbol: stock.symbol,
        name: stock.name,
        image: stock.image,
        bPrice: 250,
        pValue: 5000
      })
    ).to.be.true;
    expect(stock.shares).to.equal(1);
    expect(marketComponent.money).to.equal(4750);

    getFirstDataMock.restore();
    postStub.restore();
  });

  it('should throw an error for insufficient funds', async () => {
    marketComponent = (await fixture('<app-market></app-market>')) as MarketComponent;
    const getFirstDataMock = sinon
      .stub(marketComponent.stockService!, 'getFirstData')
      .resolves({ price: 200, percentage: 3 });

    const responseMock = {
      status: 201,
      json: () => Promise.resolve({ money: 100 })
    };
    const postStub = sinon.stub(httpClient, 'post').resolves(responseMock as Response);

    const stock: UserStock = {
      symbol: 'AAPL',
      name: 'Apple Inc.',
      image: 'apple.png',
      shares: 0,
      price: 250,
      dailyPercentage: 5
    };

    marketComponent.money = 100;

    try {
      await marketComponent.buyStock(new Event('click'), stock);
      console.log('läuft ');
    } catch (error: any) {
      console.log('error ' + error);
      expect(error).to.be.an.instanceOf(Error);
      expect(error.message).to.include('Insufficient funds');
    }

    expect(getFirstDataMock.calledOnceWithExactly(stock.symbol)).to.be.true;
    expect(postStub.notCalled).to.be.true;
    expect(stock.shares).to.equal(0);
    expect(marketComponent.money).to.equal(100);

    getFirstDataMock.restore();
    postStub.restore();
  });

  it('should sell stock and update state correctly', async () => {
    marketComponent = (await fixture('<app-market></app-market>')) as MarketComponent;
    const getFirstDataMock = sinon
      .stub(marketComponent.stockService!, 'getFirstData')
      .resolves({ price: 250, percentage: 3 });

    const responseMock = {
      status: 200,
      json: () => Promise.resolve({ money: 5250 })
    };
    const patchStub = sinon.stub(httpClient, 'patch').resolves(responseMock as Response);

    const stock: UserStock = {
      symbol: 'AAPL',
      name: 'Apple Inc.',
      image: 'apple.png',
      shares: 2,
      price: 250,
      dailyPercentage: 5
    };

    marketComponent.money = 5250;

    await marketComponent.sellStock(new Event('click'), stock);

    expect(getFirstDataMock.calledOnceWithExactly(stock.symbol)).to.be.true;
    expect(
      patchStub.calledOnceWithExactly('/trading/', {
        symbol: stock.symbol,
        name: stock.name,
        image: stock.image,
        sPrice: 250,
        pValue: 5250
      })
    ).to.be.true;
    expect(stock.shares).to.equal(1);
    expect(marketComponent.money).to.equal(5250);

    getFirstDataMock.restore();
    patchStub.restore();
  });
});
