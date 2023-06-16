/* Autor: Alexander Lesnjak */

import { expect } from 'chai';
import { fixture, html } from '@open-wc/testing-helpers';
import sinon from 'sinon';
import './minesweeper';
import { SecretAppComponent } from './minesweeper';

describe('app-minesweeper', () => {
  let e: SecretAppComponent;

  beforeEach(async () => {
    e = await fixture(html`<app-minesweeper></app-minesweeper>`);
  });

  afterEach(() => {
    sinon.restore();
  });

  //+
  it('should render correctly', async () => {
    e.initGame();

    const usernameElement = e.shadowRoot!.querySelector('#username') as HTMLElement;
    expect(usernameElement.textContent).to.equal('...');
    expect(window.getComputedStyle(usernameElement).animationName).to.equal('rainbow');
    expect(window.getComputedStyle(usernameElement).animationDuration).to.equal('5s');
    expect(window.getComputedStyle(usernameElement).animationIterationCount).to.equal('infinite');

    const cashElement = e.shadowRoot!.querySelector('#cash') as HTMLElement;
    expect(cashElement.textContent).to.equal('cash: ... $');
    expect(window.getComputedStyle(cashElement).fontSize).to.equal('18px');

    const triesElement = e.shadowRoot!.querySelector('#tries') as HTMLElement;
    expect(triesElement.textContent).to.equal('Tries left: ...');
    expect(window.getComputedStyle(triesElement).fontSize).to.equal('18px');

    const restartButton = e.shadowRoot!.querySelector('#restart-button') as HTMLElement;
    expect(restartButton).to.exist;
  });

  //+
  it('should right-click a field and the marksleft should decrease by one and click on restart to reset marksleft', async () => {
    e.initGame();

    const cell = e.shadowRoot!.querySelector('.cell') as HTMLElement;
    const rightClick = new MouseEvent('contextmenu', { button: 2 });
    cell!.dispatchEvent(rightClick);

    expect(e.marksleft).to.equal(9);

    const marksleftElement = e.shadowRoot!.querySelector('#marksleft') as HTMLElement;
    expect(marksleftElement.textContent).to.equal('Marks left: 9');

    const restartButton = e.shadowRoot!.querySelector('#restart-button') as HTMLElement;
    restartButton.click();

    expect(e.marksleft).to.equal(10);

    const resetMarksleftElement = e.shadowRoot!.querySelector('#marksleft') as HTMLElement;
    expect(resetMarksleftElement.textContent).to.equal('Marks left: 10');
  });

  //+
  it('should left-click tiles until game over is displayed', async () => {
    e.initGame();

    const boardElement = e.shadowRoot!.querySelector('.board');
    const cells = boardElement!.querySelectorAll('.cell');

    for (let i = 0; i < cells.length; i++) {
      const cell = cells[i];
      cell.dispatchEvent(new MouseEvent('click'));
      await e.updateComplete;

      if (e.gameOver) {
        const messageElement = e.shadowRoot!.querySelector('#message');
        expect(messageElement!.textContent).to.equal('Game Over');
        return;
      }
    }

    // If the loop completes without triggering "Game Over", the test should fail
    throw new Error('Game Over message not displayed');
  });
});
