/* Autor: Nico Pareigis */

import { html, LitElement } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { map } from 'lit/directives/map.js';
import { until } from 'lit/directives/until.js';
import { httpClient } from '../../http-client';
import { router } from '../../router/router';
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

type Profit = {
  detail: string;
  header: string;
  prefix: string;
  profit: string;
};

export type Transaction = {
  userId: string;
  name: string;
  image: string;
  bPrice: string;
  sPrice: string;
  soldAt: number;
  createdAt: number;
};

export type Json = {
  total: number;
  entities: Transaction[];
};

@customElement('transaction-history')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export class TransactionHistory extends PageMixin(LitElement) {
  static styles = [sharedStyle, componentStyle];

  @state() pageNumber = 0;
  @state() pageSize = 20;
  @state() total = 0;

  private readonly year = new Date().getFullYear().toString();
  private transactions = httpClient
    .get(`/users/transactions?limit=${this.pageSize}&offset=${this.pageNumber * this.pageSize}`)
    .then(async res => (await res.json()) as Json);

  async connectedCallback() {
    super.connectedCallback();
    await httpClient.get('/users/auth').catch((e: { statusCode: number }) => {
      if (e.statusCode === 401) router.navigate('/users/sign-in');
    });
  }

  firstUpdated() {
    this.dispatchEvent(new CustomEvent('update-pagename', { bubbles: true, composed: true, detail: 'Transactions' }));
  }

  render() {
    return html`<div class="container">
      ${until(
        this.transactions
          .then(json => {
            if (json.entities.length === 0) return html`<p>There's nothing here...</p>`;
            if (json.total !== this.total) this.total = json.total;

            return html`<div class="top-navigation">
                <page-navigator
                  .length="${this.total}"
                  .pageSize="${this.pageSize}"
                  .pageNumber="${this.pageNumber}"
                  .scrollOnChange="${false}"
                  @page-change="${this.pageChange}"
                ></page-navigator>
              </div>
              ${map(json.entities, i => {
                const profit = this.getProfitDetails(i.bPrice, i.sPrice);
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
                    <span class="profit" style="--color:${profit.header}">${`${profit.prefix} ${profit.profit}`}$</span>
                    <span class="date">${this.timeDiff(i.createdAt)} ago</span>
                  </div>
                  <div class="detail">
                    <div class="transaction-data">
                      <fieldset>
                        <legend>Bought</legend>
                        <p>${this.timeDiff(i.createdAt)} ago for <b>${i.bPrice}$</b></p>
                        <hr />
                        <p>${this.formatDate(boughtAt, false)} at ${this.formatTime(boughtAt)}</p>
                      </fieldset>
                      <fieldset>
                        <legend>Sold</legend>
                        ${i.soldAt
                          ? html`<p>${this.timeDiff(i.soldAt)} ago for <b>${i.sPrice}$</b></p>
                              <hr />
                              <p>${this.formatDate(soldAt, false)} at ${this.formatTime(soldAt)}</p>`
                          : html`<p>Not yet sold.</p>`}
                      </fieldset>
                    </div>
                    <div class="transaction-summary">
                      <p class="profit" style="--color:${profit.detail}">${`${profit.prefix} ${profit.profit}`}$</p>
                      <p>Held for ${this.timeDiff(i.createdAt, i.soldAt)}.</p>
                    </div>
                  </div>
                </div>`;
              })}

              <page-navigator
                style="margin: auto"
                .length="${this.total}"
                .pageSize="${this.pageSize}"
                .pageNumber="${this.pageNumber}"
                @page-change="${this.pageChange}"
              ></page-navigator>`;
          })
          .catch(() => {
            this.showNotification('Failed to load transactions. Please try again.');
          }),
        html`<is-loading></is-loading>`
      )}
    </div>`;
  }

  getProfitDetails(boughtFor: string, soldFor: string): Profit {
    const nBoughtFor = Number(boughtFor);
    const nSoldFor = Number(soldFor);
    const profit = nSoldFor === 0 ? -nBoughtFor : (nSoldFor * 100 - nBoughtFor * 100) / 100;
    const detail = profit < 0 ? '#ff0d0d' : '#0d942b';

    return {
      detail,
      header: nSoldFor === 0 ? 'gray' : detail,
      prefix: profit === 0 ? '±' : profit < 0 ? '↓' : '↑',
      profit: profit.toFixed(profit % 1 === 0 ? 0 : 2)
    };
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

  pageChange(e: CustomEvent) {
    const newPage = e.detail;
    this.transactions = httpClient
      .get(`/users/transactions?limit=${this.pageSize}&offset=${newPage * this.pageSize}`)
      .then(async res => (await res.json()) as Json)
      .then(json => {
        this.pageNumber = newPage;
        return json;
      });
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
