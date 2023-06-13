/* Autor: Nico Pareigis */

import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import sharedStyle from '../../shared.css?inline';
import componentStyle from './page-navigator.css?inline';

@customElement('page-navigator')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class PageNavigator extends LitElement {
  static styles = [sharedStyle, componentStyle];

  @property() length!: number;
  @property() pageNumber = 0;
  @property() pageSize = 10;
  @property() scrollOnChange = true;

  private readonly minPage = 0;
  private maxPage = 0;
  private pageDisplay!: number;

  render() {
    this.pageDisplay = this.pageNumber + 1;
    this.maxPage = Math.ceil(this.length / this.pageSize) - 1;

    return html`<div class="page ${this.maxPage === 0 ? 'hidden' : ''}">
        <div @click="${() => this.changePage('b')}">&#x23f4</div>

        <div
          class="${this.pageNumber === this.maxPage && this.maxPage > 1 ? '' : 'hidden'}"
          @click="${() => this.changePage(this.pageDisplay - 2)}"
        >
          ${this.pageDisplay - 2}
        </div>
        <div
          class="${this.pageNumber === this.minPage ? 'hidden' : ''}"
          @click="${() => this.changePage(this.pageDisplay - 1)}"
        >
          ${this.pageDisplay - 1}
        </div>
        <div class="selected">${this.pageDisplay}</div>
        <div
          class="${this.pageNumber === this.maxPage ? 'hidden' : ''}"
          @click="${() => this.changePage(this.pageDisplay + 1)}"
        >
          ${this.pageDisplay + 1}
        </div>
        <div
          class="${this.pageNumber === this.minPage && this.maxPage > 1 ? '' : 'hidden'}"
          @click="${() => this.changePage(this.pageDisplay + 2)}"
        >
          ${this.pageDisplay + 2}
        </div>

        <div @click="${() => this.changePage('f')}">&#x23f5</div>
      </div>
    </div>`;
  }

  changePage(page: 'b' | 'f' | number) {
    let newPage: number;
    if (typeof page === 'number') {
      newPage = --page;
    } else {
      switch (page) {
        case 'b':
          newPage = Math.max(this.minPage, this.pageNumber - 1);
          break;
        case 'f':
          newPage = Math.min(this.maxPage, this.pageNumber + 1);
          break;
      }
    }
    if (newPage === this.pageNumber) return;
    if (this.scrollOnChange) window.scrollTo({ top: 0, behavior: 'smooth' });
    this.pageNumber = newPage;
    this.dispatchEvent(new CustomEvent('page-change', { bubbles: true, detail: this.pageNumber }));
  }
}
