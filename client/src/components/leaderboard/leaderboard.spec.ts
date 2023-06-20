/* Autor: Alexander Lesnjak */

import { expect } from 'chai';
import { fixture, html } from '@open-wc/testing-helpers';
import sinon from 'sinon';
import './leaderboard';
import { AppLeaderboardComponent } from './leaderboard';

describe('app-leaderboard', () => {
  let e: AppLeaderboardComponent;

  beforeEach(async () => {
    e = await fixture(html`<app-leaderboard></app-leaderboard>`);
  });

  afterEach(() => {
    sinon.restore();
  });

  //+
  it('should render correctly and be mobile responsive', async () => {
    window.innerWidth = 1800;
    const pagetitle = e.shadowRoot!.querySelector('#pagetitle') as HTMLElement;
    expect(pagetitle).to.exist;
    expect(window.getComputedStyle(pagetitle).display).to.equal('flex');

    const content = e.shadowRoot!.querySelector('#content') as HTMLElement;
    expect(content).to.exist;
    expect(window.getComputedStyle(content).position).to.equal('relative');

    const images = e.shadowRoot!.querySelector('#images') as HTMLElement;
    expect(images).to.exist;
    expect(window.getComputedStyle(images).display).to.equal('flex');

    window.innerWidth = 700;

    expect(window.getComputedStyle(images).width).to.equal('550px');
  });
});
