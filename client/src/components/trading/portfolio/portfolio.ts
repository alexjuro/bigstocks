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
import { stocks } from '../../../interfaces/stock-interface.js';
import { httpClient } from '../../../http-client';
import { router } from '../../../router/router';

@customElement('app-portfolio')
export class PortfolioComponent extends TradingComponent {
  static colorArray = [
    '#800080',
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
  @state() userStocks = [
    {
      name: stocks[0].name,
      symbol: stocks[0].symbol,
      price: stocks[0].price,
      image: stocks[0].image,
      shares: 2,
      dailyPercentage: stocks[0].dailyPercentage
    },
    {
      name: stocks[1].name,
      symbol: stocks[1].symbol,
      price: stocks[1].price,
      image: stocks[1].image,
      shares: 1,
      dailyPercentage: stocks[1].dailyPercentage
    },
    {
      name: stocks[15].name,
      symbol: stocks[15].symbol,
      price: stocks[15].price,
      image: stocks[15].image,
      shares: 8,
      dailyPercentage: stocks[15].dailyPercentage
    },
    {
      name: stocks[3].name,
      symbol: stocks[3].symbol,
      price: stocks[3].price,
      image: stocks[3].image,
      shares: 3,
      dailyPercentage: stocks[3].dailyPercentage
    },
    {
      name: stocks[4].name,
      symbol: stocks[4].symbol,
      price: stocks[4].price,
      image: stocks[4].image,
      shares: 5,
      dailyPercentage: stocks[4].dailyPercentage
    },
    {
      name: stocks[18].name,
      symbol: stocks[18].symbol,
      price: stocks[18].price,
      image: stocks[18].image,
      shares: 28,
      dailyPercentage: stocks[18].dailyPercentage
    }
  ];
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
      const newStatusJSON = await httpClient.get('/users/new' + location.search);
      const newStatus = (await newStatusJSON.json()).new;
      if (newStatus) {
        this.showNotification('new user was created successfully', 'info');
      }
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

  async connectedCallback() {
    super.connectedCallback();
    await this.stockService.connectSocket();
    this.stockService.setObserver(this);
    this.sendSubscriptions();
    this.stockService.updateStockPercentages();
    this.createDoughnut();
    this.createGraph();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.stockService.closeSocket();
  }

  getStockShares(): number[] {
    return this.userStocks.map(stock => stock.shares);
  }

  createDoughnut() {
    this.ChartDoughnut = new Chart(this.doughnut, {
      type: 'doughnut',
      data: {
        labels: this.getStockNames(),
        datasets: [
          {
            data: this.getCumulatedPrices(),
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
    if (this.ChartDoughnut instanceof Chart) {
      this.ChartDoughnut.data.labels = this.getStockNames();
      this.ChartDoughnut.data.datasets[0].data = this.getCumulatedPrices();
      this.ChartDoughnut.update();
    }
  }

  createGraph() {
    this.ChartGraph = new Chart(this.graph, {
      type: 'line',
      data: {
        labels: ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        datasets: [
          {
            data: [20, 30, 40, 35, 45, 70, 60, 65, 40, 30, 40, 35, 45, 45, 40, 55],
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
            <div class= "graph">
                <h1 id=upp> Portfolio-Graph </h1>
                <canvas id="graph" "</canvas>
            </div>
            <div class="allo">
                <h1 id=upp> Portfolio-Allocation </h1>
                <canvas id="doughnut"</canvas>
            </div>
        </div>
        <div class="part-container">
          <div>
            <p class="account" >32000$</p>
            <p class="account" >12000$</p>
          </div>
          <div class="portfolio-page">
            <h1 id=upp> My Portfolio </h1>
            ${this.userStocks.map(
              stock => html`
                <app-stock class="stock" id=${stock.symbol}>
                  <span id="dot${stock.symbol}" class="dot"></span>
                  <img src="${stock.image}" alt="${stock.name} Logo" />
                  <h2 @click=${this.handleStockClick}>${stock.name}</h2>
                  <p class="prices" id="price${stock.symbol}">Price: ${stock.price ? stock.price + '$' : 'N/A'}</p>
                  <p class="percentages" id="perc${stock.symbol}">
                    ${stock.dailyPercentage ? stock.dailyPercentage + '%' : 'N/A'}
                  </p>
                  <p class="shares" id="shares${stock.symbol}">${stock.shares}x</p>
                </app-stock>
              `
            )}
          </div>
        </div>
    

    </div>
    
    `;
  }
}
