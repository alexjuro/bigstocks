/* Autor: Alexander Schellenberg */

import { customElement } from 'lit/decorators.js';
import { PageMixin } from '../../page.mixin';
import { LitElement, html } from 'lit';
import { property, query } from "lit-element";
import sharedStyle from '../../shared.css?inline';
import componentStyle from './portfolio.css?inline';
import { StockService } from '../../../stock-service.js';
import Chart from 'chart.js/auto';
import { StockComponent } from '../stockcomponent.js';
import { stocks, UserStock } from '../../../interfaces/stock-interface.js';


@customElement('app-portfolio')
export class PortfolioComponent extends StockComponent {
    constructor(){
    super();
    }
    
    static colorArray = [
    "#581f4d", "#653162", "#713b78", "#7e4791", "#8a52aa", 
    "#966fbc", "#a48ccf", "#b2a8e2", "#c0c4f5", "#cfd3f9", 
    "#dfe1fd", "#eff0fe", "#f5effe", "#f8e7fe", "#fbdff9", 
    "#fdd8f4", "#fed1ee", "#ffcbe7", "#ffb6d9", "#ffa1cb"
    ];
    static styles = [sharedStyle, componentStyle];
    @query('#doughnut') doughnut!: HTMLCanvasElement;
    @property({ type: Array })
    userStocks = [
        { name: stocks[7].name, symbol: stocks[7].symbol, price: stocks[7].price, image: stocks[7].image, shares: 2, dailyPercentage: stocks[7].dailyPercentage },
        { name: stocks[1].name, symbol: stocks[1].symbol, price: stocks[1].price, image: stocks[1].image, shares:1, dailyPercentage: stocks[1].dailyPercentage },
        { name: stocks[15].name, symbol: stocks[15].symbol, price: stocks[15].price, image: stocks[15].image, shares:8, dailyPercentage: stocks[15].dailyPercentage },
        { name: stocks[3].name, symbol: stocks[3].symbol, price: stocks[3].price, image: stocks[3].image, shares:3, dailyPercentage: stocks[3].dailyPercentage },
        { name: stocks[4].name, symbol: stocks[4].symbol, price: stocks[4].price, image: stocks[4].image, shares: 5, dailyPercentage: stocks[4].dailyPercentage },
        { name: stocks[18].name, symbol: stocks[18].symbol, price: stocks[18].price, image: stocks[18].image, shares: 28, dailyPercentage: stocks[18].dailyPercentage }
    ];
    @property({ type: Object })
    stockService = new StockService();
    @property({ type: Object })
    private Chart = {};



    getCumulatedPrices() {
        const prices = this.getStockPrices();
        const shares = this.getStockShares();
        let cum: Number[] = [];
        for (let i = 0; i < this.userStocks.length; i++){
            cum[i] = prices[i] * shares[i];
        }
        return cum;
    }

    
    async connectedCallback() {
        super.connectedCallback();
        await this.stockService.connectSocket()
        this.sendSubscriptions();
        this.stockService.addObserver(this);
        this.stockService.updateStockPercentages();
        this.createDoughnut();
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this.stockService.closeSocket();
    }
    
    
    createDoughnut() {
        this.Chart = new Chart(this.doughnut,
            {
                type: "doughnut",
                data: {
                    labels: this.getStockNames(),
                    datasets: [{
                        data: this.getCumulatedPrices(),
                        // backgroundColor: PortfolioComponent.colorArray,
                    }]
                },
                options: {
                    plugins: {
                        tooltip: {
                            callbacks: {
                                label: (context: any) => {
                                const label = context.label;
                                const currentValue = context.raw.toFixed(2);
                                const total = context.chart._metasets[context.datasetIndex].total;
                                const percentage = parseFloat((currentValue / total * 100).toFixed(1));
                                    
                                return `${currentValue}$ (${percentage}%)`;
                                }
                            }
                        },
                        subtitle: {
                            display: true,
                            text: "Your " + this.userStocks.length + " stocks!"
                        },
                        legend:
                        {
                            labels: {
                                font: {
                                    size: 12
                                }
                            }
                        }
                    },
                    animation: {
                        onComplete: function () {
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
            ${this.userStocks.map(stock => html`
                <div class="stock" id= ${stock.symbol}>
                    <span id="dot${stock.symbol}" class="dot"></span>
                    <img src="${stock.image}" alt="${stock.name} Logo">
                    <h2> ${stock.name}</h2>
                    <p id="price${stock.symbol}">Price: ${stock.price ? stock.price + '$' : 'N/A'} </p>
                    <p class="percentages" id="perc${stock.symbol}"> ${stock.dailyPercentage ? stock.dailyPercentage +'%' : 'N/A'} </p>
                    <p class="shares" id="shares${stock.symbol}">${stock.shares}x</p>
                </div>
            `)}
        </div>
    
        <div class="allo flex-container">
            <h1 id=upp> Portfolio-Allocation </h1>
            <canvas id="doughnut" width="450" height="450"</canvas>
        </div>
        <div class=" flex-container">
            <h1 id=upp> Portfolio-Graph </h1>
            <img src="https://media.ycharts.com/charts/ee62177c5e5720e04a3bf5c8298ca3e1.png" width="500" length="500" alt="Test">
        </div>
    </div>
    
    `;
    }


}

