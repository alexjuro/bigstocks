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
    private stocks: Stock[] = [
        { symbol: 'AAPL', price: 200 },
        { symbol: 'GOOGL', price: 300 },
        { symbol: 'TSLA', price: 40 },
        { symbol: 'MSFT', price: 100 },
        { symbol: 'AMZN', price: 90 }];
    @property({ type: Object })
    private StockService = new StockService();
    @property({ type: Object })
    private Chart = {};

    getStocks(){
        return this.stocks;
    }
    getLabels() {
        const labels = this.stocks.map(stock => stock.symbol);
        return labels;
    }

    getPrices() {
        const prices = this.stocks.map(stock => stock.price);
        return prices;
    }
    setPrice(symbol : String, price: number){
        for (const a of this.stocks)
        {
            if (a.symbol == symbol)
            {
                a.price = price
            }
            this.updateChart();
        }
    }

    sendSubscriptions() {
        for (const a of this.stocks) {
            this.StockService.subscribe(a.symbol);
        };
    }

    firstUpdated() {
        this.createChart();
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
    
    createChart() {
        this.Chart = new Chart(this.canvas,
            {
                type: "doughnut",
                data: {
                    labels: this.getLabels(),
                    datasets: [{
                        data: this.getPrices(),
                        // backgroundColor: ["#FFA07A", "#FA8072", "#E9967A", "#F08080", "#CD5C5C"],
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
 
    updateChart()
    {
        if (this.Chart instanceof Chart)
        {
            this.Chart.data.labels = this.getLabels();
            this.Chart.data.datasets[0].data = this.getPrices();
            this.Chart.update();
        }
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