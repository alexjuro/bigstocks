/* Autor: Alexander Schellenberg */

import { customElement } from 'lit/decorators.js';
import { PageMixin } from '../page.mixin';
import { LitElement, html } from 'lit';
import { property, query } from "lit-element";
import sharedStyle from '../shared.css?inline';
import componentStyle from './portfolio.css?inline';
import { Stock, StockService } from '../stock-service/stock-service.js';
import Chart from 'chart.js/auto';

@customElement('app-portfolio')
export class PortfolioComponent extends PageMixin(LitElement) {
    static styles = [sharedStyle, componentStyle];
    @query('#doughnut') canvas!: HTMLCanvasElement;
    @property({ type: Array })
    stocks: Stock[] = [
        { symbol: 'AAPL', price: 255 },
        { symbol: 'GOOGL', price: 301 },
        { symbol: 'TSLA', price: 200 },
        { symbol: 'MSFT', price: 500 },
        { symbol: 'AMZN', price: 540 }];
    @property({ type: Object })
    private StockService = new StockService();
    @property({ type: Object })
    private Chart = {};

    getLabels() {
        const labels = this.stocks.map(stock => stock.symbol);
        return labels;
    }

    getPrices() {
        const prices = this.stocks.map(stock => stock.price);
        return prices;
    }

    firstUpdated() {
        this.createChart();
    }

    connectedCallback() {
        super.connectedCallback();
        this.StockService.connectSocket();
        for (const a of this.stocks) {
            this.StockService.subscribe(a.symbol);
        }
        this.StockService.addObserver(this);
    }
  

    disconnectedCallback() {
        super.disconnectedCallback();
        this.StockService.closeSocket();
    }
    
    createChart() {
        this.Chart = new Chart(this.canvas,
            {
                type: "pie",
                data: {
                    labels: this.getLabels(),
                    datasets: [{
                        data: this.getPrices(),
                        
                    }]
                },
                options: {
                    animation: {
                        onComplete: function () {
                            console.log('Line Chart Rendered Completely!');
                        }
                    },
                }
            }
        )
    }


    render() {
        return html`
      <div class="portfolio-page">
        ${this.stocks.map(stock => html`
            <div class="stock">
            <h1> ${stock.symbol}</h1>
            <p>Price: ${stock.price ? stock.price.toFixed(2) : 'N/A'}</p>
            <p>Shares: 2 </p>
            </div>
        `)}
        <canvas id="doughnut" width="268" height="268"</canvas>
      </div>
    `;
    }


}
/*
  async connectSocket() {
    const apiKey = 'cgsjqchr01qkrsgj9tk0cgsjqchr01qkrsgj9tkg';
    const url = `wss://ws.finnhub.io?token=${apiKey}`;

    try {
      this.socket = new WebSocket(url);

    this.addUsersStocks();

        this.updateUsersStocks();

    } catch (error) {
      console.error('WebSocket connection error', error);
    }
  }
  

    async addUsersStocks() {
        this.socket?.addEventListener('open', (event) => {
        
        this.stocks.forEach(stock => {
          this.socket?.send(JSON.stringify({ type: 'subscribe', symbol: stock.symbol }));
        });
      });
    }

    async updateUsersStocks() {
        this.socket?.addEventListener('message', (event) => {
        const data = JSON.parse(event.data);

        if (data.type === 'trade' && data.data && data.data[0]) {
          const an = data.data[0];
          const stockIndex = this.stocks.findIndex(stock => stock.symbol === an.s);

          if (stockIndex >= 0) {
            this.stocks[stockIndex].price = an.p;
            this.requestUpdate();
          }
        }
      });
    }

  disconnectSocket() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
      console.log('WebSocket connection closed');
    }
  }
    
    */