/* Autor: Alexander Schellenberg */

import { expect } from 'chai';
import sinon, { SinonStubbedInstance } from 'sinon';
import { LitElement } from 'lit';
import { fixture } from '@open-wc/testing-helpers';
import { StockService } from '../../../stock-service';
import './portfolio';
import { httpClient } from '../../../http-client';
import { PortfolioComponent } from './portfolio';
import { UserStock } from '../stock-interface';
import { Chart } from 'chart.js';

describe('app-portfolio', () => {
  let stocks: UserStock[];

  beforeEach(() => {
    stocks = [
      { symbol: 'AAPL', name: 'Apple', image: 'aplimage', shares: 4, price: 150, dailyPercentage: 2.5 },
      { symbol: 'MSFT', name: 'Microsoft', image: 'msftimage', shares: 2, price: 300, dailyPercentage: -1.8 }
    ];
  });
  afterEach(() => {
    sinon.restore();
  });
  let element: PortfolioComponent;
  let stockServiceStub: SinonStubbedInstance<StockService>;

  it('should fetch the stocks on first update', async () => {
    const stub = sinon.stub(httpClient, 'get');
    const element = (await fixture('<app-portfolio></app-portfolio>')) as LitElement;
    await element.updateComplete;
    expect(stub.calledOnce).to.be.true;
  });

  it('should render the fetched stocks with correct values', async () => {
    sinon.stub(httpClient, 'get').returns(
      Promise.resolve({
        json() {
          return Promise.resolve({ results: stocks });
        }
      } as Response)
    );

    const fixtureElement = (await fixture('<app-portfolio></app-portfolio>')) as PortfolioComponent;
    await fixtureElement.updateComplete;

    fixtureElement.requestUpdate();
    await fixtureElement.updateComplete;

    const stockElements = fixtureElement.shadowRoot!.querySelectorAll('app-stock');
    expect(stockElements.length).to.equal(2);

    for (let i = 0; i < stocks.length; i++) {
      const stock = stocks[i];
      const stockElement = stockElements[i] as HTMLElement;

      const stockSymbol = stockElement.getAttribute('id');
      expect(stockSymbol).to.equal(stock.symbol);

      const stockNameElement = stockElement.querySelector('h2');
      const stockName = stockNameElement?.textContent;
      expect(stockName).to.equal(stock.name);

      const stockSharesElement = stockElement.querySelector('.shares');
      const stockShares = stockSharesElement?.textContent?.trim();
      expect(stockShares).to.equal(`${stock.shares}x`);

      const stockPriceElement = stockElement.querySelector('.prices');
      const stockPrice = stockPriceElement?.textContent?.trim();
      expect(stockPrice).to.equal('Price: ' + (stock.price ? stock.price + '$' : 'N/A'));

      const stockPercentageElement = stockElement.querySelector('.percentages');
      const stockPercentage = stockPercentageElement?.textContent?.trim();
      expect(stockPercentage).to.equal(stock.dailyPercentage ? stock.dailyPercentage + '%' : 'N/A');
    }
  });

  it('should update the graph when calling updateGraph method', async () => {
    const fixtureElement = (await fixture('<app-portfolio></app-portfolio>')) as PortfolioComponent;
    await fixtureElement.updateComplete;

    let d1 = new Date(Date.now() - 86400000).toLocaleDateString();
    d1 = d1.split('/').join('.');
    let d2 = new Date(Date.now() - 86400000 * 2).toLocaleDateString();
    d2 = d2.split('/').join('.');
    let d3 = new Date().toLocaleDateString();
    d3 = d3.split('/').join('.');

    const chartData = {
      labels: [d1, d2],
      datasets: [
        {
          data: [1000, 2000]
        }
      ]
    };
    const fakeChart = {
      data: chartData,
      update: sinon.stub(),
      options: {
        plugins: {
          subtitle: {
            text: ''
          }
        }
      }
    };

    fixtureElement.ChartGraph = fakeChart as unknown as Chart;

    fixtureElement.money = 1500;
    fixtureElement.calculateTotalValue = () => 2500;

    fixtureElement.updateGraph();

    expect(chartData.labels).to.deep.equal([d1, d2, d3]);
    expect(chartData.datasets[0].data).to.deep.equal([1000, 2000, 4000]);

    expect(fakeChart.update.calledOnce).to.be.true;
  });

  it('should calculate cumulative prices correctly', () => {
    const component = new PortfolioComponent();
    component.userStocks = stocks;

    const result = component.getCumulatedPrices();

    expect(result[0]).equal(600);
    expect(result[1]).equal(600);
  });

  it('calculates total value correctly', () => {
    const component = new PortfolioComponent();
    component.userStocks = stocks;

    const totalValue = component.calculateTotalValue();

    expect(totalValue).equal(1200);
  });

  it('updates doughnut chart correctly', () => {
    const component = new PortfolioComponent();
    component.ChartDoughnut = {
      data: {
        labels: ['Stock A', 'Stock B'],
        datasets: [
          {
            data: [100, 200],
            backgroundColor: ['#E58400', '#663399']
          }
        ]
      },
      options: {
        plugins: {
          subtitle: {
            text: ''
          }
        }
      },
      update: sinon.stub()
    };
    component.money = 300;
    component.calculateTotalValue = function () {
      return 150;
    };

    const getStockNamesStub = sinon.stub(component, 'getStockNames').returns(['Stock A', 'Stock B']);

    const getCumulatedPricesStub = sinon.stub(component, 'getCumulatedPrices').returns([100, 200]);

    component.updateDoughnut();

    expect(component.ChartDoughnut.data.labels).to.deep.equal(['CASH', 'Stock A', 'Stock B']);
    expect(component.ChartDoughnut.data.datasets[0].data).to.deep.equal([300, 100, 200]);
    expect(component.ChartDoughnut.update.calledOnce).to.be.true;
  });
});
