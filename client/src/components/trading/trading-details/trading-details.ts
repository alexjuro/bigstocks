/* Autor: Alexander Schellenberg */

import { LitElement, html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import sharedStyle from '../../shared.css?inline';
import componentStyle from './trading-details.css?inline';
import sharedTradingStyle from '../shared-trading.css?inline';
import { TradingComponent } from '../tradingcomponent.js';
import { httpClient } from '../../../http-client';
import { router } from '../../../router/router';
import { Chart, ChartData, ChartOptions } from 'chart.js/auto';
import { StockService } from '../../../stock-service';
import { PageMixin } from '../../page.mixin';
import xss from 'xss';

export interface Note {
  symbol: string;
  note: string;
}

@customElement('app-trading-details')
export class TradingDetailsComponent extends PageMixin(LitElement) {
  static styles = [sharedStyle, componentStyle, sharedTradingStyle];

  @property({ type: Object })
  stockService = new StockService();

  @property({ type: Object })
  private ChartBar = {};

  @property({ type: String })
  private name = '';

  @property({ type: String })
  private symbol = '';

  @property({ type: Object })
  private companyData: any = {};

  @property()
  private stock: any = {};

  @property()
  private note: Note = {
    symbol: '',
    note: ''
  };

  @query('form') private form!: HTMLFormElement;

  // eslint-disable-next-line @typescript-eslint/member-ordering
  @query('#bar') bar!: HTMLCanvasElement;

  async firstUpdated() {
    try {
      this.startAsyncInit();
      this.name = this.getParamsFromURL().name;
      this.symbol = this.getParamsFromURL().symbol;
      this.dispatchEvent(
        new CustomEvent('update-pagename', { detail: `${this.symbol}-Details`, bubbles: true, composed: true })
      );
      const response = await httpClient.get('trading/details/' + this.symbol);
      const data = await response.json();
      this.stock = data.stock;
      this.note = data.note;
      this.companyData = await this.stockService.getCompanyProfilBySymbol(this.symbol);
      const cData = await this.stockService.getRecommendationBySymbol(this.symbol);
      this.createBar(cData);
    } catch (e) {
      if ((e as { statusCode: number }).statusCode === 401) {
        router.navigate('/users/sign-in');
      } else {
        this.showNotification((e as Error).message, 'error');
      }
    } finally {
      this.finishAsyncInit();
    }
  }

  getParamsFromURL() {
    const url = new URL(window.location.href);
    const symbol = url.searchParams.get('symbol')!;
    const name = url.searchParams.get('name')!;
    return { symbol, name };
  }

  createBar(data: any) {
    const bar = this.shadowRoot?.querySelector('#bar') as HTMLCanvasElement;

    if (bar) {
      const labels = ['Strong Buy', 'Buy', 'Hold', 'Sell', 'Strong Sell'];
      const chartData: ChartData = {
        labels: labels,
        datasets: [
          {
            data: [data.strongBuy || 0, data.buy || 0, data.hold || 0, data.sell || 0, data.strongSell || 0],
            backgroundColor: [
              'rgba(54, 250, 50, 0.8)',
              'rgba(120, 250, 120, 0.5)',
              'rgba(255, 205, 86, 0.8)',
              'rgba(255, 140, 120, 0.8)',
              'rgba(250, 50, 50, 0.8)'
            ]
          }
        ]
      };

      const chartOptions: ChartOptions = {
        responsive: true
      };

      this.ChartBar = new Chart(bar, {
        type: 'pie',
        data: chartData,
        options: chartOptions
      });
    }
  }

  async handleSubmit(event: Event) {
    event.preventDefault();
    const formData = new FormData(this.form);
    const noteText = formData.get('ftext') as string;
    if (this.isFormValid() && this.validate(noteText)) {
      const note: Note = {
        ...this.note,
        symbol: this.symbol,
        note: noteText
      };
      try {
        const response = await httpClient.post('trading/details/', { note });
        console.log('Form submitted!', noteText);
        router.navigate('/trading/market');
      } catch (e) {
        this.showNotification((e as Error).message, 'error');
      }
    } else {
      this.form.classList.add('error-validation');
    }
  }

  isFormValid() {
    return this.form.checkValidity();
  }

  validate(note: string) {
    let result = true;
    // Überprüfung auf potenzielle NOSQL-Injection
    const nosqlInjectionPattern = /[$\\'"]/;

    if (nosqlInjectionPattern.test(note)) {
      result = false;
    }

    // Überprüfung auf potenzielle XSS-Attacken
    const sanitizedNote = xss(note);
    if (sanitizedNote !== note) {
      result = false;
    }
    return result;
  }

  render() {
    return html`
      ${this.renderNotification()}
      <div>
        <div class="container">
          <div class="stock">
            <div class="card-title">
              <img src="${this.stock.image}"> </img>
              <h1>${this.name}</h1>
            </div>
            <div class="canvas">
              <canvas id="bar"></canvas>
            </div>
            <p>Name: ${this.companyData.name}</p>
            <p>Ticker: ${this.companyData.ticker}</p>
            <p>Country: ${this.companyData.country}</p>
            <p>MarketCapitalization: ${(this.companyData.marketCapitalization / 1000).toFixed(2)} BN $</p>
            <p>Exchange: ${this.companyData.exchange}</p>
            <p>WebUrl: ${this.companyData.weburl}</p>
            <p>Industry: ${this.companyData.finnhubIndustry}</p>
            <p>IPO: ${this.companyData.ipo}</p>
            <form @submit=${this.handleSubmit} novalidate>
              <label for="ftext">Your notes:</label><br>
              <textarea id="ftext" name="ftext" rows="1" cols="50" placeholder="Enter your notes here">${
                this.note ? this.note.note : ''
              }</textarea>
              <button type="submit">Submit</button>
            </form>
          </div>
        </div>
      </div>
    `;
  }
}
