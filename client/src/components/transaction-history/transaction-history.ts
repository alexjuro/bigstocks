/* Author: Nico Pareigis */

import { html, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { map } from 'lit/directives/map.js';
import { until } from 'lit/directives/until.js';
import { httpClient } from '../../http-client';
import { PageMixin } from '../page.mixin';
import sharedStyle from '../shared.css?inline';
import componentStyle from './transaction-history.css?inline';

type Date = {
  day: string;
  month: string;
  year: string;
  hour: string;
  minute: string;
  second: string;
};

type Transaction = {
  userId: string;
  name: string;
  image: string;
  bPrice: number;
  sPrice: number;
  soldAt: number;
  createdAt: number;
};

@customElement('transaction-history')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class TransactionHistory extends PageMixin(LitElement) {
  static styles = [sharedStyle, componentStyle];

  @property() pageNumber = 0;

  @state() transactions = httpClient.get('/users/transactions').then(async res => (await res.json()) as Transaction[]);

  private readonly year = new Date().getFullYear().toString();
  private readonly pageSize = 20;

  render() {
    return html`<div class="container">
      <div class="intro">Transaction History</div>
      ${until(
        this.transactions
          .then(json => {
            if (json.length === 0) return html`<p>There's nothing here...</p>`;

            return html`<div class="top-navigation">
                <page-navigator
                  .length="${json.length}"
                  .pageSize="${this.pageSize}"
                  .pageNumber="${this.pageNumber}"
                  .scrollOnChange="${false}"
                  @page-change="${(e: CustomEvent) => (this.pageNumber = e.detail)}"
                ></page-navigator>
              </div>
              ${map(
                json.slice(0 + this.pageNumber * this.pageSize, this.pageSize + this.pageNumber * this.pageSize),
                i => {
                  const profit = this.calculateProfit(i.bPrice, i.sPrice);
                  const color = profit === 0 ? 'gray' : profit < 0 ? '#ff0d0d' : '#0d942b';
                  const prefix = profit === 0 ? '±' : profit < 0 ? '↓' : '↑';
                  const boughtAt = this.formatPartsToObj(
                    new Intl.DateTimeFormat([], {
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                      month: 'long',
                      second: '2-digit',
                      year: 'numeric'
                    }).formatToParts(i.createdAt)
                  );
                  const soldAt = this.formatPartsToObj(
                    new Intl.DateTimeFormat([], {
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                      month: 'long',
                      second: '2-digit',
                      year: 'numeric'
                    }).formatToParts(i.soldAt)
                  );

                  return html`<div class="transaction">
                    <div class="header" @click="${this.toggleDetail}">
                      <div class="stock">
                        <img src="${i.image}" />
                        <span>${i.name}</span>
                      </div>
                      <span class="profit" style="--color:${color}">${prefix + ' ' + profit}€</span>
                      <span class="date">${this.timeDiff(i.createdAt)} ago</span>
                    </div>
                    <div class="detail">
                      <div class="transaction-data">
                        <fieldset>
                          <legend>Bought</legend>
                          <p>${this.timeDiff(i.createdAt)} ago for <b>${i.bPrice}€</b></p>
                          <hr />
                          <p>${this.formatDate(boughtAt, false)} at ${this.formatTime(boughtAt)}</p>
                        </fieldset>
                        <fieldset>
                          <legend>Sold</legend>
                          ${i.soldAt
                            ? html`<p>${this.timeDiff(i.soldAt)} ago for <b>${i.sPrice}€</b></p>
                                <hr />
                                <p>${this.formatDate(soldAt, false)} at ${this.formatTime(soldAt)}</p>`
                            : html`<p>Not yet sold.</p>`}
                        </fieldset>
                      </div>
                      <div class="transaction-summary">
                        <p class="profit" style="--color:${color}">${prefix + ' ' + profit}€</p>
                        <p>Held for ${this.timeDiff(i.createdAt, i.soldAt)}.</p>
                      </div>
                    </div>
                  </div>`;
                }
              )}
              <page-navigator
                style="margin: auto"
                .length="${json.length}"
                .pageSize="${this.pageSize}"
                .pageNumber="${this.pageNumber}"
                @page-change="${(e: CustomEvent) => (this.pageNumber = e.detail)}"
              ></page-navigator>`;
          })
          .catch(() => {
            this.showNotification('Failed to load transactions. Please try again.');
          }),
        html`<is-loading></is-loading>`
      )}
    </div>`;
  }

  calculateProfit(boughtFor: number, soldFor: number): number {
    if (soldFor === 0) return -boughtFor;
    return Number(((soldFor * 100 - boughtFor * 100) / 100).toFixed(2));
  }

  formatPartsToObj(parts: Intl.DateTimeFormatPart[]): Date {
    const obj: Date = {} as Date;

    const keep = ['day', 'month', 'year', 'hour', 'minute', 'second'];
    parts.forEach(p => {
      if (keep.includes(p.type)) Reflect.set(obj, p.type, p.value);
    });

    return obj;
  }

  formatDate(date: Date, short: boolean): string {
    if (short && date.month !== 'May') date.month = date.month.substring(0, 3) + '.';
    return `${date.day}. ${date.month} ${short && date.year === this.year ? '' : date.year}`;
  }

  formatTime(date: Date): string {
    return `${date.hour}:${date.minute}:${date.second}`;
  }

  timeDiff(t1: number, t2?: number): string {
    const msHour = 3_600_000;
    let diff = ((t2 || Date.now()) - t1) / msHour;
    let unit = 'Hour';

    if (diff >= 24) {
      diff /= 24;
      unit = 'Day';
    }

    if (diff >= 365) {
      diff /= 365;
      unit = 'Year';
    }

    return `${Math.floor(diff)} ${unit}${diff !== 1 ? 's' : ''}`;
  }

  toggleDetail(e: Event) {
    const transaction = (e.target as HTMLElement).closest('.transaction')!;
    transaction.querySelector('.header')?.classList.toggle('visible');
    transaction.querySelector('.detail')?.classList.toggle('visible');
  }
}
