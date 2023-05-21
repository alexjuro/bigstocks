/* eslint-disable @typescript-eslint/member-ordering */
/* Autor: Alexander Schellenberg */

import { customElement, state } from 'lit/decorators.js';
import { html } from 'lit';
import { property, query } from 'lit-element';
import sharedStyle from '../../shared.css?inline';
import componentStyle from './portfolio.css?inline';
import sharedTradingStyle from '../shared-trading.css?inline';
import { StockService } from '../../../stock-service.js';
import Chart from 'chart.js/auto';
import { TradingComponent } from '../tradingcomponent.js';
import { UserStock } from '../../../interfaces/stock-interface.js';
import { httpClient } from '../../../http-client';
import { router } from '../../../router/router';
// import ChartDataLabels from 'chartjs-plugin-datalabels';

@customElement('app-portfolio')
export class PortfolioComponent extends TradingComponent {
  static colorArray = [
    '#20FCB6',
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
  private ChartDoughnut = {};
  @property({ type: Object })
  private ChartGraph = {};

  constructor() {
    super();
  }

  async firstUpdated() {
    try {
      this.startAsyncInit();
      const response = await httpClient.get('trading' + location.search);
      const data = await response.json();
      const userTransactions = data.results;
      this.money = data.money;
      this.userStocks = userTransactions.map((transaction: UserStock) => ({
        name: transaction.name,
        symbol: transaction.symbol,
        price: 0,
        image: transaction.image,
        shares: transaction.shares,
        dailyPercentage: 0
      }));

      this.stockService.setObserver(this);
      await this.stockService.connectSocket();
      this.sendSubscriptions();
      this.stockService.updateStockPercentages();
      // Chart.register(ChartDataLabels);
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
              label: (context: any) => {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const label = context.label;
                const currentValue = context.raw.toFixed(2);
                const total = context.chart._metasets[context.datasetIndex].total;
                const percentage = parseFloat(((currentValue / total) * 100).toFixed(1));

                return `${currentValue}$ (${percentage}%)`;
              }
            }
          },

          subtitle: {
            display: true,
            text: 'You have ' + this.userStocks.length + ' stocks!'
          },
          legend: {
            labels: {
              font: {
                size: 16
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
    if (this.ChartDoughnut instanceof Chart) {
      this.ChartDoughnut.data.labels = stockNames;
      this.ChartDoughnut.data.datasets[0].data = cumulatedPrices;
      this.ChartDoughnut.update();
    }
  }

  createGraph(performance: { date: string; value: number }[]) {
    const labels = performance.map(entry => entry.date.slice(0, 5));
    const values = performance.map(entry => entry.value);
    this.ChartGraph = new Chart(this.graph, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            data: values,
            borderColor: '#9370DB',
            backgroundColor: '#9370DB',
            borderWidth: 3,
            tension: 0.2,
            fill: true,
            pointBackgroundColor: '#411080',
            pointBorderColor: '#6A5ACD'
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          subtitle: {
            display: true,
            text: '69% in the last week',
            font: { weight: 'bold' },
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
        } /*,
        animation: {
          onComplete: function () {}
        }*/
      }
    });
  }

  render() {
    return html`
      ${this.renderNotification()}
      <div class="container">
        <div class="part-container">
          <div class="graph">
            <h1 id="upp">Portfolio-Graph</h1>
            <canvas id="graph"></canvas>
          </div>
          <div class="allo">
            <h1 id="upp">Portfolio-Allocation</h1>
            <canvas id="doughnut"></canvas>
          </div>
        </div>
        <div class="part-container">
          <div>
            <p class="account">CASH: ${this.money}$</p>
            <p class="account">STOCKS: ${this.calculateTotalValue()}$</p>
          </div>
          ${this.userStocks.length > 0
            ? html`
                <div class="portfolio-page">
                  <h1 id="upp">My Portfolio</h1>
                  ${this.userStocks.map(
                    stock => html`
                      <app-stock class="stock" id=${stock.symbol}>
                        <span id="dot${stock.symbol}" class="dot"></span>
                        <img src="${stock.image}" alt="${stock.name} Logo" />
                        <h2 @click=${(event: MouseEvent) => this.handleStockClick(event, stock)}>${stock.name}</h2>
                        <p class="prices" id="price${stock.symbol}">
                          Price: ${stock.price ? stock.price + '$' : 'N/A'}
                        </p>
                        <p class="percentages" id="perc${stock.symbol}">
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
