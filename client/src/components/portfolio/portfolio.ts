/* Autor: Alexander Schellenberg */

import { customElement } from 'lit/decorators.js';
import { PageMixin } from '../page.mixin';
import { LitElement, html } from 'lit';
import { property, query } from "lit-element";
import sharedStyle from '../shared.css?inline';
import componentStyle from './portfolio.css?inline';
import { Stock, StockService } from '../../stock-service.js';
import Chart from 'chart.js/auto';


@customElement('app-portfolio')
export class PortfolioComponent extends PageMixin(LitElement) {
    static styles = [sharedStyle, componentStyle];
    @query('#doughnut') doughnut!: HTMLCanvasElement;
    @property({ type: Array })
    private stocks: Stock[] = [
        { name: 'Apple', symbol: 'AAPL', price: 0, shares:2 },
        { name: 'Alphabet', symbol: 'GOOGL', price: 0, shares:3 },
        { name: 'Tesla',symbol: 'TSLA', price: 0, shares:1 },
        { name: 'Microsoft',symbol: 'MSFT', price: 0, shares:2 },
        { name: 'Amazon',symbol: 'AMZN', price: 0, shares:7 }];
    @property({ type: Object })
    private StockService = new StockService();
    @property({ type: Object })
    private Chart = {};

    getStocks(){
        return this.stocks;
    }
    getStockSymbols() {
        const labels = this.stocks.map(stock => stock.symbol);
        return labels;
    }

    getStockNames() {
        const names = this.stocks.map(stock => stock.name);
        return names;
    }

    getStockPrices() {
        const prices = this.stocks.map(stock => stock.price);
        return prices;
    }

    setStockPrice(symbol: String, price: number) {
        let s = "blinkRed";
        let change = false;
        for (const a of this.stocks)
        {
            if (a.symbol == symbol)
            {
                if (a.price != price)
                {
                    change = true;
                }
                if (a.price < price)
                {
                    s = "blinkGreen"
                }
                a.price = price;
            }
            this.updateDoughnut();
            if (change)
            {
               const element = this.shadowRoot?.getElementById(a.symbol);
                if (element) {
                    element.classList.add(s);
                    setTimeout(() => {
                        element.classList.remove(s);
                    }, 1000);
                } 
                break;
            }
        }
    }

    getStockShares() {
        const shares = this.stocks.map(stock => stock.shares);
        return shares
    }


    getCumulatedPrices() {
        const prices = this.getStockPrices();
        const shares = this.getStockShares();
        let cum: Number[] = [];
        for (let i = 0; i < this.stocks.length; i++){
            cum[i] = prices[i] * shares[i];
        }
        return cum;
    }

    sendSubscriptions() {
        for (const a of this.stocks) {
            this.StockService.subscribe(a.symbol);
        };
    }

    firstUpdated() {
        this.createDoughnut();
    }
    
    async connectedCallback() {
        super.connectedCallback();
        await this.StockService.connectSocket()
        this.sendSubscriptions();
        this.StockService.addObserver(this);
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this.StockService.closeSocket();
    }
    
    
    createDoughnut() {
        this.Chart = new Chart(this.doughnut,
            {
                type: "doughnut",
                data: {
                    labels: this.getStockNames(),
                    datasets: [{
                        data: this.getCumulatedPrices(),
                        backgroundColor: ["#581f4d", "#77325f", "#923d5b", "#c3415b", "#dd6868"],
                    }]
                },
                options: {
                    plugins: {
                        legend: {
                            labels: {
                                // This more specific font property overrides the global property
                                font: {
                                    size: 20
                                }
                            }
                        }
                    },
                    animation: {
                        onComplete: function () {
                            console.log('Line Chart Rendered Completely!');
                        }
                    },
                }
            }
        )
    }
 
    updateDoughnut()
    {
        if (this.Chart instanceof Chart)
        {
            this.Chart.data.labels = this.getStockNames();
            this.Chart.data.datasets[0].data = this.getCumulatedPrices();
            this.Chart.update();
        }
    }


    

    render() {
        return html`
      <div class="portfolio-page">
        <h1 id=upp> My Portfolio </h1>
        ${this.stocks.map(stock => html`
            <div class="stock" id= ${stock.symbol}>
            <h1> ${stock.name}</h1>
            <p>Price: ${stock.price ? stock.price.toFixed(2) +'$' : 'N/A'} </p>
            <p>Shares: ${stock.shares} </p>
            </div>
        `)}
        <div>
            <h1 id=allo> portfolio-allocation </h1>
            <canvas id="doughnut" width="268" height="268"</canvas>
        </div>
      </div>
    `;
    }


}