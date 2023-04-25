/* Autor: Alexander Schellenberg */

import { customElement } from 'lit/decorators.js';
import { PageMixin } from '../page.mixin';
import { LitElement, html } from 'lit';
import { property, query } from "lit-element";
import sharedStyle from '../shared.css?inline';
import componentStyle from './portfolio.css?inline';
import { StockService } from '../../stock-service.js';
import Chart from 'chart.js/auto';
import { StockComponent } from '../../interfaces/stockcomponent-interface.js';
import { stocks, UserStock } from '../../interfaces/stock-interface.js';


@customElement('app-portfolio')
export class PortfolioComponent extends PageMixin(LitElement) implements StockComponent{
    static styles = [sharedStyle, componentStyle];
    @query('#doughnut') doughnut!: HTMLCanvasElement;
    @property({ type: Array })
    private stocks: UserStock[] = [
        { name: stocks[0].name, symbol: stocks[0].symbol, price: stocks[0].price, image: stocks[0].image, shares:2},
        { name: stocks[1].name, symbol: stocks[1].symbol, price: stocks[1].price, image: stocks[1].image, shares:1},
        { name: stocks[2].name, symbol: stocks[2].symbol, price: stocks[2].price, image: stocks[2].image, shares:8},
        { name: stocks[3].name, symbol: stocks[3].symbol, price: stocks[3].price, image: stocks[3].image, shares:3},
        { name: stocks[4].name, symbol: stocks[4].symbol, price: stocks[4].price, image: stocks[4].image, shares: 5}
    ];
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

    updateStockPrice(symbol: String, price: number) {
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
               const element = this.shadowRoot?.getElementById(a.name);
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
                        data: this.getCumulatedPrices()
                        //backgroundColor: ["#581f4d", "#77325f", "#923d5b", "#c3415b", "#dd6868"],
                    }]
                },
                options: {
                    plugins: {
                        subtitle: {
                            display: true,
                            text: "Your " + this.stocks.length + " stocks!"
                        },
                        legend: {
                            labels: {
                                font: {
                                    size: 8
                                }
                            }
                        }
                    },
                    animation: {
                        onComplete: function () {
                            console.log('Line Chart Rendered Completely!');
                        }
                    },
                },
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
    <div class="container">
        <div class="portfolio-page flex-container">
            <h1 id=upp> My Portfolio </h1>
            ${this.stocks.map(stock => html`
                <div class="stock" id= ${stock.symbol}>
                    <span id=${stock.name} class="dot"></span>
                    <img src="${stock.image}" alt="${stock.name} Logo">
                    <h1> ${stock.name}</h1>
                    <p>Price: ${stock.price ? stock.price +'$' : 'N/A'} </p>
                    <p>Shares: ${stock.shares} </p>
                </div>
            `)}
        </div>
    
        <div class="allo flex-container">
            <h1 id=upp> Portfolio-Allocation </h1>
            <canvas id="doughnut" width="268" height="268"</canvas>
        </div>
        <div class=" flex-container">
            <h1 id=upp> Portfolio-Graph </h1>
        </div>
    </div>
    
    `;
    }


}