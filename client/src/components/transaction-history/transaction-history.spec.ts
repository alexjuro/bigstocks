/* Author: Nico Pareigis */

import { fixture, html } from '@open-wc/testing-helpers';
import { expect } from 'chai';
import sinon from 'sinon';
import { httpClient } from '../../http-client';
import './transaction-history';

import { Json, Transaction, TransactionHistory } from './transaction-history';

describe('transaction-history', () => {
  let el: TransactionHistory;
  let sr: ShadowRoot;

  const t1: Transaction = {
    userId: '0',
    name: 'Amazon',
    image: 'amazon_img_url',
    bPrice: '10.00',
    sPrice: '0',
    soldAt: 0,
    createdAt: 0
  };

  const t2: Transaction = {
    userId: '0',
    name: 'Microsoft',
    image: 'microsoft_img_url',
    bPrice: '10.00',
    sPrice: '20.00',
    soldAt: 1,
    createdAt: 0
  };

  const json: Json = {
    total: 3,
    entities: [t1, t2]
  };

  beforeEach(async () => {
    sinon.stub(TransactionHistory.prototype, 'connectedCallback');
    sinon
      .stub(httpClient, 'get')
      .withArgs('/users/transactions?limit=20&offset=0')
      .resolves({
        status: 200,
        json: async () => json
      } as Response);

    el = (await fixture(html`<transaction-history></transaction-history>`)) as TransactionHistory;
    sr = el.shadowRoot!;
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should render transactions', async () => {
    await el.updateComplete;

    expect(sr.querySelectorAll('.transaction').length).to.equal(2);

    // t1
    // header
    expect((sr.querySelector('.stock > img') as HTMLImageElement).src).to.match(RegExp(`/${t1.image}$`));
    expect((sr.querySelector('.stock > span') as HTMLSpanElement).textContent).to.equal(t1.name);
    // detail
    const p1 = TransactionHistory.prototype.getProfitDetails(t1.bPrice, t1.sPrice);
    expect((sr.querySelector('.transaction-summary > .profit') as HTMLParagraphElement).textContent).to.equal(
      `${p1.prefix} ${p1.profit}€`
    );

    // t2
    // header
    expect((sr.querySelectorAll('.stock > img').item(1) as HTMLImageElement).src).to.match(RegExp(`/${t2.image}$`));
    expect((sr.querySelectorAll('.stock > span').item(1) as HTMLSpanElement).textContent).to.equal(t2.name);
    // detail
    const p2 = TransactionHistory.prototype.getProfitDetails(t2.bPrice, t2.sPrice);
    expect(
      (sr.querySelectorAll('.transaction-summary > .profit').item(1) as HTMLParagraphElement).textContent
    ).to.equal(`${p2.prefix} ${p2.profit}€`);
  });
});
