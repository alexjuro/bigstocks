/* Autor Alexander Schellenberg */

import { expect } from 'chai';
import sinon from 'sinon';
import { LitElement } from 'lit';
import { fixture } from '@open-wc/testing-helpers';
import { TradingComponent } from '../tradingcomponent';
import { StockService } from '../../../stock-service';
import './market';
import { httpClient } from '../../../http-client';

describe('app-market', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should fetch the stocks on first update', async () => {
    const stub = sinon.stub(httpClient, 'get');
    const element = (await fixture('<app-market></app-market>')) as LitElement;
    await element.updateComplete;
    expect(stub.calledOnce).to.be.true;
  });

  it('should render the fetched stocks', async () => {
    const stocks = [
      { symbol: 'AAPL', name: 'Apple', iamge: 'aplimage', shares: 4 },
      { symbol: 'MSFT', name: 'Microsoft', iamge: 'aplimage', shares: 2 }
    ];

    sinon.stub(httpClient, 'get').returns(
      Promise.resolve({
        json() {
          return Promise.resolve({ results: stocks });
        }
      } as Response)
    );

    const element = (await fixture('<app-market></app-market>')) as LitElement;
    await element.updateComplete;
    element.requestUpdate();
    await element.updateComplete;

    const portElems = element.shadowRoot!.querySelectorAll('app-stock');
    expect(portElems.length).to.equal(2);
  });
});
