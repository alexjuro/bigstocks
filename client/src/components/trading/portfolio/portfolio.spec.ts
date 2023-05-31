import { expect } from 'chai';
import sinon, { SinonStubbedInstance } from 'sinon';
import { LitElement } from 'lit';
import { fixture, nextFrame } from '@open-wc/testing-helpers';
import { TradingComponent } from '../tradingcomponent';
import { StockService } from '../../../stock-service';
import './portfolio';
import { httpClient } from '../../../http-client';
import { PortfolioComponent } from './portfolio';

describe('app-portfolio', () => {
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

  it('should render the fetched stocks', async () => {
    const stocks = [
      { symbol: 'AAPL', name: 'Apple', image: 'aplimage', shares: 4 },
      { symbol: 'MSFT', name: 'Microsoft', image: 'msftimage', shares: 2 }
    ];

    sinon.stub(httpClient, 'get').returns(
      Promise.resolve({
        json() {
          return Promise.resolve({ results: stocks });
        }
      } as Response)
    );

    const fixtureElement = (await fixture('<app-portfolio></app-portfolio>')) as LitElement;
    element = fixtureElement as PortfolioComponent;
    await element.updateComplete;
    element.requestUpdate();
    await element.updateComplete;

    const portElems = element.shadowRoot!.querySelectorAll('app-stock');
    expect(portElems.length).to.equal(2);
  });
});
