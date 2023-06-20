/* Autor: Alexander Schellenberg */

import { LitElement, html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { customElement, property, query } from 'lit/decorators.js';
import sharedStyle from '../../shared.css?inline';
import componentStyle from './trading-details.css?inline';
import sharedTradingStyle from '../shared-trading.css?inline';
import { httpClient } from '../../../http-client';
import { router } from '../../../router/router';
import { Chart, ChartData, ChartOptions } from 'chart.js/auto';
import { StockService } from '../../../stock-service';
import { PageMixin } from '../../page.mixin';
import { UserStock } from '../stock-interface';

export interface Note {
  symbol: string;
  note: string;
}

@customElement('app-trading-details')
export class TradingDetailsComponent extends PageMixin(LitElement) {
  static styles = [sharedStyle, componentStyle, sharedTradingStyle];

  @property({ type: Object })
  stockService = new StockService();

  @query('#bar') bar!: HTMLCanvasElement;

  @property({ type: Object })
  private ChartBar = {};

  @property({ type: String })
  private name = '';

  @property({ type: String })
  private symbol = '';

  @property({ type: Object })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private companyData: any = {};

  @property()
  private stock: UserStock = {
    shares: 0,
    name: '',
    symbol: '',
    image: '',
    price: 0,
    dailyPercentage: 0
  };

  @property()
  private note: Note = {
    symbol: '',
    note: ''
  };

  @query('form') private form!: HTMLFormElement;

  async firstUpdated() {
    try {
      this.startAsyncInit();
      await httpClient.get('/users/auth').catch((e: { statusCode: number }) => {
        if (e.statusCode === 401) router.navigate('/users/sign-in');
      });
      this.name = this.getParamsFromURL().name;
      this.symbol = this.getParamsFromURL().symbol;
      this.dispatchEvent(new CustomEvent('update-pagename', { detail: `${this.name}`, bubbles: true, composed: true }));
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    const sanNote = this.sanitizeInput(noteText);
    if (this.isFormValid() && this.validate(noteText)) {
      if (sanNote == 'Invalid Input') {
        this.showNotification('Please submit a valid note. Potential attack detected.', 'error');
        this.form.classList.add('error-validation');
        return;
      }
      const note: Note = {
        ...this.note,
        symbol: this.symbol,
        note: this.sanitizeInput(noteText)
      };
      try {
        await httpClient.post('trading/details/', { note });
        router.navigate('/trading/market');
      } catch (e) {
        this.showNotification((e as Error).message, 'error');
      }
    } else {
      this.showNotification('Please submit a valid note', 'error');
      this.form.classList.add('error-validation');
    }
  }

  isFormValid() {
    return this.form.checkValidity();
  }

  validate(note: string) {
    let result = true;
    const allowedCharacters = /^[a-zA-Z0-9 !.&<$!?]+$/;

    if (!allowedCharacters.test(note)) {
      result = false;
    }
    return result;
  }

  sanitizeInput(input: string) {
    const safeCharacters = /^[a-zA-Z0-9 !.&<$!?#;]+$/;
    const safeTags = /<(?!(?:\/\s*)?(?:script|template|style)\b)[^>]*>/i;
    const safeEventHandlers = /(?<!\w)on\w+=/i;
    const safeInput = input.replace(safeTags, '').replace(safeEventHandlers, '');

    const sanitizedInput = safeInput
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');

    if (!safeCharacters.test(sanitizedInput)) {
      return 'Invalid Input';
    }

    return safeInput;
  }

  desanitizeInput(input: string) {
    const desanitizedInput = input
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#x27;/g, "'")
      .replace(/&#x2F;/g, '/');

    return desanitizedInput;
  }

  /*

  async connectedCallback() {
    super.connectedCallback();
    await httpClient.get('/users/auth').catch((e: { statusCode: number }) => {
      if (e.statusCode === 401) router.navigate('/users/sign-in');
    });
  }

  */

  render() {
    const safeNote = this.note ? this.note.note : '';
    return html`
      ${this.renderNotification()}
      <div>
        <div class="container">
          <div class="stock">
            <div class="card-title">
              <img src="${this.stock.image}"> </img>
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
              <textarea id="ftext" name="ftext" rows="1" cols="50" maxlength="500" placeholder="Enter your notes here">${unsafeHTML(
                safeNote
              )}</textarea>
              <button type="submit">Submit</button>
            </form>
          </div>
        </div>
      </div>
    `;
  }
}
