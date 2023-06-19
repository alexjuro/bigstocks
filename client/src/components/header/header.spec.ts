/* Autor: Alexander Lesnjak */

import { expect } from 'chai';
import { fixture, html } from '@open-wc/testing-helpers';
import sinon from 'sinon';
import './header';
import { AppHeader } from './header';

describe('app-header', () => {
  let e: AppHeader;

  beforeEach(async () => {
    e = await fixture(html`<app-header></app-header>`);
  });

  afterEach(() => {
    sinon.restore();
  });

  //+
  it('should render properly', async () => {
    expect(e).to.exist;

    expect(e.shadowRoot).to.exist;

    const dnav = e.shadowRoot!.querySelector('#dnav');
    expect(dnav).to.exist;

    const circle = e.shadowRoot!.querySelector('#circle') as HTMLElement;
    expect(circle).to.exist;
    expect(window.getComputedStyle(circle).height).to.equal('0px');
    expect(window.getComputedStyle(circle).width).to.equal('0px');

    const mnav = e.shadowRoot!.querySelector('#mnav') as HTMLElement;
    expect(mnav).to.exist;
    expect(window.getComputedStyle(mnav).visibility).to.equal('hidden');

    expect(e.toggle).to.be.a('function');
    expect(e.autoResize).to.be.a('function');
    expect(e.getLeaderboard).to.be.a('function');
    expect(e.getNews).to.be.a('function');
    expect(e.getPortfolio).to.be.a('function');
    expect(e.getMarket).to.be.a('function');
    expect(e.getProfile).to.be.a('function');
    expect(e.getFriends).to.be.a('function');
    expect(e.getSignOut).to.be.a('function');
  });

  //+
  it('should show the button and not display the dnav when changing to mobile version', async () => {
    const mnav = e.shadowRoot!.querySelector('#mnav') as HTMLElement;
    const circle = e.shadowRoot!.querySelector('#circle') as HTMLElement;
    const dnav = e.shadowRoot!.querySelector('#dnav') as HTMLElement;

    //test visability of the mnav, btn and circle
    expect(getComputedStyle(mnav).visibility).to.equal('hidden');
    expect(getComputedStyle(circle).width).to.equal('0px');
    expect(getComputedStyle(circle).height).to.equal('0px');

    //resize to mobile variant
    window.innerWidth = 800;
    window.dispatchEvent(new Event('resize'));

    expect(getComputedStyle(dnav).display).to.equal('none');
  });
});
