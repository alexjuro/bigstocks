/* Autor: Alexander Schellenberg */

import { customElement } from 'lit/decorators.js';
import { html } from 'lit';
import { property, query } from 'lit-element';
import sharedStyle from '../../shared.css?inline';
import componentStyle from './portfolio.css?inline';
import sharedTradingStyle from '../shared-trading.css?inline';
import { StockService } from '../../../stock-service.js';
import Chart from 'chart.js/auto';
import { TradingComponent } from '../tradingcomponent.js';
import { UserStock } from '../stock-interface.js';
import { httpClient } from '../../../http-client';
import { router } from '../../../router/router';

@customElement('app-portfolio')
export class PortfolioComponent extends TradingComponent {
  static colorArray = [
    '#E58400',
    '#663399',
    '#BA55D3',
    '#DDA0DD',
    '#483D8B',
    '#E6E6FA',
    '#FF00FF',
    '#4B0082',
    '#9932CC',
    '#9370DB',
    '#EE82EE',
    '#D8BFD8',
    '#DA70D6',
    '#7B68EE',
    '#8B008B',
    '#6A5ACD',
    '#FF00FF',
    '#8A2BE2',
    '#9400D3',
    '#FF00FF'
  ];

  static styles = [sharedStyle, componentStyle, sharedTradingStyle];
  @query('#doughnut') doughnut!: HTMLCanvasElement;
  @query('#graph') graph!: HTMLCanvasElement;
  @property({ type: Object })
  stockService = new StockService();
  @property({ type: Object })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ChartDoughnut: any;
  @property({ type: Object })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ChartGraph: any;

  private sortBy: 'shares' | 'alphabet' = 'alphabet';

  constructor() {
    super();
  }

  async firstUpdated() {
    this.dispatchEvent(new CustomEvent('update-pagename', { detail: 'Portfolio', bubbles: true, composed: true }));
    try {
      this.startAsyncInit();
      await httpClient.get('/users/auth').catch((e: { statusCode: number }) => {
        if (e.statusCode === 401) router.navigate('/users/sign-in');
      });
      const response = await httpClient.get('trading' + location.search);
      const data = await response.json();
      const userTransactions = data.results;
      this.money = data.money;
      this.userStocks = userTransactions.map((transaction: UserStock) => ({
        name: transaction.name,
        symbol: transaction.symbol,
        price: transaction.price || 0,
        image: transaction.image,
        shares: transaction.shares,
        dailyPercentage: transaction.dailyPercentage || 0
      }));

      this.stockService.setObserver(this);
      await this.stockService.connectSocket();
      this.sendSubscriptions();
      this.stockService.updateStockPercentages();
      this.createDoughnut();
      this.createGraph(data.performance);
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

  getCumulatedPrices() {
    const prices = this.getStockPrices();
    const shares = this.getStockShares();
    const cum: number[] = [];
    for (let i = 0; i < this.userStocks.length; i++) {
      cum[i] = prices[i] * shares[i];
    }
    return cum;
  }

  /*

  async connectedCallback() {
    super.connectedCallback();
    await httpClient.get('/users/auth').catch((e: { statusCode: number }) => {
      if (e.statusCode === 401) router.navigate('/users/sign-in');
    });
  }

  */

  disconnectedCallback() {
    super.disconnectedCallback();
    this.stockService.closeSocket();
  }

  getStockShares(): number[] {
    return this.userStocks.map(stock => stock.shares);
  }

  createDoughnut() {
    const stockNames = this.getStockNames();
    const cumulatedPrices = this.getCumulatedPrices();
    const totalMoney = this.money;

    stockNames.unshift('Bar Money');
    cumulatedPrices.unshift(totalMoney);
    this.ChartDoughnut = new Chart(this.doughnut, {
      type: 'doughnut',
      data: {
        labels: stockNames,
        datasets: [
          {
            data: cumulatedPrices,
            backgroundColor: PortfolioComponent.colorArray
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          tooltip: {
            callbacks: {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              label: (context: any) => {
                const currentValue = context.raw.toFixed(2);
                const total = context.chart._metasets[context.datasetIndex].total;
                const percentage = parseFloat(((currentValue / total) * 100).toFixed(1));

                return `${currentValue}$ (${percentage}%)`;
              }
            }
          },

          subtitle: {
            display: true,
            position: 'left',
            text: 'You have ' + this.userStocks.length + ' stocks!',
            font: {
              size: 14
            }
          },
          legend: {
            labels: {
              font: {
                size: 12
              }
            }
          }
        }
      }
    });
  }

  updateDoughnut() {
    const stockNames = this.getStockNames();
    const cumulatedPrices = this.getCumulatedPrices();
    const totalMoney = this.money;

    stockNames.unshift('CASH');
    cumulatedPrices.unshift(totalMoney);
    this.ChartDoughnut.data.labels = stockNames;
    this.ChartDoughnut.data.datasets[0].data = cumulatedPrices;
    this.ChartDoughnut.options.plugins.subtitle.text = 'You have ' + this.userStocks.length + ' stocks!';
    this.ChartDoughnut.update();
  }

  createGraph(performance: { date: string; value: number }[]) {
    const labels = performance.map(entry => entry.date.slice(0, entry.date.indexOf('.') + 2));
    const values = performance.map(entry => entry.value);
    const firstValue = values[0];
    const lastValue = values[values.length - 1];
    const percentageChange = ((lastValue - firstValue) / firstValue) * 100;
    this.ChartGraph = new Chart(this.graph, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            data: values,
            borderColor: '#9370DB',
            borderWidth: 3,
            borderDash: [5, 5],
            tension: 0.3,
            pointBackgroundColor: '#E6E6FA',
            pointRadius: 3,
            fill: { above: 'rgba(0, 230, 0,0.1)', below: 'rgba(230,0, 0,0.1)', target: { value: values[0] } }
          }
        ]
      },
      options: {
        animation: false,
        responsive: true,
        plugins: {
          subtitle: {
            display: true,
            text: `${percentageChange.toFixed(2)}% from ${labels[0]} to ${labels[labels.length - 1]}`,
            font: { size: 14, weight: 'bold' },
            position: 'top'
          },
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            grace: '10%',
            grid: { display: false }
          },
          x: {
            grace: '10%',
            grid: { display: false }
          }
        }
      }
    });
  }

  updateGraph() {
    const labels = this.ChartGraph.data.labels ?? [];
    const lastLabel = labels[labels?.length - 1];
    const data = this.ChartGraph.data.datasets[0].data;
    let day = new Date().toLocaleDateString();
    day = day.split('/').join('.');
    const slicedDay = day.slice(0, day.indexOf('.') + 2);
    if (slicedDay == lastLabel) {
      data.pop();
      data.push(this.money + this.calculateTotalValue());
    } else {
      if (!(labels.length < 20)) {
        labels.shift();
        data.shift();
      }
      labels?.push(slicedDay);
      data.push(this.money + this.calculateTotalValue());
    }
    const firstValue = data[0];
    const lastValue = data[data.length - 1];
    const percentageChange = ((lastValue - firstValue) / firstValue) * 100;
    this.ChartGraph.options.plugins.subtitle.text = `${percentageChange.toFixed(2)}% from ${labels[0]} to ${
      labels[labels.length - 1]
    }`;
    this.ChartGraph.update();
    this.requestUpdate();
  }

  sortStocks() {
    if (this.sortBy === 'alphabet') {
      this.userStocks.sort((a, b) => {
        return a.symbol.localeCompare(b.symbol);
      });
    } else if (this.sortBy === 'shares') {
      this.userStocks.sort((a, b) => {
        return b.shares - a.shares;
      });
    }
    this.requestUpdate();
  }

  toggleSort() {
    this.sortBy = this.sortBy == 'alphabet' ? 'shares' : 'alphabet';
    const candle = this.shadowRoot!.querySelector('app-trading-candle');
    const info = this.shadowRoot!.querySelector('app-trading-info');
    if (candle) {
      candle.remove();
    }
    if (info) {
      info.remove();
    }
    this.sortStocks();
  }

  render() {
    return html`
      ${this.renderNotification()}
      <div class="container">
        <app-trading-notification></app-trading-notification>
        <div class="part-container graph-container">
          <h1 id="pUpp" class="upp">Portfolio-Graph</h1>
          <div class="graph">
            <canvas id="graph"></canvas>
          </div>
          <h1 id="aUpp" class="upp">Portfolio-Allocation</h1>
          <div class="allo">
            <canvas id="doughnut"></canvas>
          </div>
        </div>
        <div class="part-container info-container">
          <div style="margin-top: 0px" class="money">
            <p class="account" style="color: ${PortfolioComponent.colorArray[0]}">
              <img src="dollar.png" alt="Cash Icon" class="icon" />
              ${this.money}$
            </p>
            <img src="up.png" alt="Up Icon" class="icon" />
            <p class="account pValue">${(this.money + this.calculateTotalValue()).toFixed(1)}$</p>
            <img src="down.png" alt="Down Icon" class="icon" />
            <p class="account" style="color: ${PortfolioComponent.colorArray[1]}">
              <img src="stock.png" alt="Stock Icon" class="icon" />
              ${this.calculateTotalValue()}$
            </p>
          </div>
          ${this.userStocks.length > 0
            ? html`
                <div class="portfolio-page">
                  <button id="sort" @click=${this.toggleSort}>
                    ${this.sortBy === 'alphabet' ? 'Sort Shares' : 'Sort Alphabetically'}
                  </button>
                  <h1 class="upp">Your Stocks</h1>
                  ${this.userStocks.map(
                    stock => html`
                      <app-stock class="stock" id=${stock.symbol}>
                        <span id="dot${stock.symbol}" class="dot"></span>
                        <img src="${stock.image}" alt="${stock.name} Logo" />
                        <h2 @click=${(event: MouseEvent) => this.handleStockClick(event, stock)}>${stock.name}</h2>
                        <p class="prices" id="price${stock.symbol}">
                          Price: ${stock.price ? stock.price + '$' : 'N/A'}
                        </p>
                        <p
                          class="percentages"
                          id="perc${stock.symbol}"
                          style="color: ${stock.dailyPercentage >= 0 ? 'green' : 'red'}"
                        >
                          ${stock.dailyPercentage ? stock.dailyPercentage + '%' : 'N/A'}
                        </p>
                        <p class="shares" id="shares${stock.symbol}">${stock.shares}x</p>
                      </app-stock>
                    `
                  )}
                </div>
              `
            : ''}
        </div>
      </div>
    `;
  }
}
