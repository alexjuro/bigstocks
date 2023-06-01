/* Autor: Alexander Schellenberg */
import { PageMixin } from '../page.mixin';
import { LitElement } from 'lit';
import { StockService } from '../../stock-service.js';
import { UserStock, Stock } from '../../interfaces/stock-interface.js';
import Chart from 'chart.js/auto';
import { router } from '../../router/router.js';
import { httpClient } from '../../http-client';
import { PortfolioComponent } from './portfolio/portfolio';

export abstract class TradingComponent extends PageMixin(LitElement) {
  public userStocks: UserStock[] = [];
  public stockService: StockService | null = null;
  public stockCandle: object | null = null;
  public money = 0;
  public publicUrl = './../../../../public/';

  getMoney(): number {
    return this.money;
  }

  getStocks(): UserStock[] {
    return this.userStocks;
  }

  getStockSymbols(): string[] {
    return this.userStocks.map(stock => stock.symbol);
  }

  getStockNames(): string[] {
    return this.userStocks.map(stock => stock.name);
  }

  getStockPrices(): number[] {
    return this.userStocks.map(stock => stock.price);
  }

  getStockDailyPercentage(): number[] {
    return this.userStocks.map(stock => stock.dailyPercentage);
  }

  sendSubscriptions(): void {
    for (const stock of this.userStocks) {
      this.stockService!.subscribe(stock.symbol);
    }
  }

  updateStockPrice(symbol: string, price: number): void {
    let cssClass = 'blinkRed';
    for (const stock of this.userStocks) {
      if (stock.symbol === symbol) {
        if (stock.price === price) {
          break;
        }
        if (stock.price < price) {
          cssClass = 'blinkGreen';
        }
        stock.price = price;

        if (this.shadowRoot) {
          const element = this.shadowRoot.getElementById('dot' + stock.symbol);

          if (element) {
            element.classList.add(cssClass);
            setTimeout(() => {
              element.classList.remove(cssClass);
            }, 1000);
          }
        }
        break;
      }
    }
  }

  updateStockDailyPercentage(symbol: string, percentage: number): void {
    const stock = this.userStocks.find(s => s.symbol === symbol);
    if (!stock) return;
    if (this.shadowRoot) {
      const element = this.shadowRoot.getElementById(`perc${stock.symbol}`);
      if (!element) {
        console.log('FAIL');
        return;
      }

      element.classList.remove('setTextGreen', 'setTextRed');
      const cssClass = percentage >= 0 ? 'setTextGreen' : 'setTextRed';
      element.classList.add(cssClass);
      stock.dailyPercentage = percentage;
    }
  }

  async handleStockClick(event: MouseEvent, stock: UserStock) {
    const stockDiv = (event.target as HTMLElement).closest('.stock');
    if (stockDiv) {
      const element = stockDiv.parentElement?.querySelector('.candle-div');
      const infoDiv = stockDiv.parentElement?.querySelector('.info-div');

      if (element || infoDiv) {
        element?.remove();
        infoDiv?.remove();
      } else {
        const newEmptyDiv = document.createElement('div');
        newEmptyDiv.classList.add('candle-div');
        stockDiv.appendChild(newEmptyDiv);

        const canvasElement = document.createElement('canvas');
        canvasElement.width = 200;
        canvasElement.height = 300;
        newEmptyDiv.appendChild(canvasElement);
        this.createStockCandles(canvasElement, stockDiv.id, 'M');

        const infoDiv = document.createElement('div');
        infoDiv.classList.add('info-div');
        stockDiv.appendChild(infoDiv);

        // Erstellung des Kaufen-Buttons
        const buyButton = document.createElement('button');
        buyButton.textContent = 'Buy';
        buyButton.classList.add('buy');
        buyButton.addEventListener('click', event => {
          event.stopPropagation();
          console.log('Buy');
          this.buyStock(event, stock);
        });
        infoDiv.appendChild(buyButton);

        const buyImg = document.createElement('img');
        buyImg.src = './../../../../buy.png';
        buyButton.appendChild(buyImg);

        const sellButton = document.createElement('button');
        sellButton.textContent = 'Sell';
        sellButton.classList.add('sell');
        sellButton.addEventListener('click', event => {
          event.stopPropagation();
          console.log('Sell');
          this.sellStock(event, stock);
        });
        infoDiv.appendChild(sellButton);

        const sellImg = document.createElement('img');
        sellImg.src = './../../../../sell.png';
        sellButton.appendChild(sellImg);

        const stockDetailsButton = document.createElement('button');
        stockDetailsButton.textContent = 'Details';
        stockDetailsButton.classList.add('stockdetails');
        stockDetailsButton.addEventListener('click', event => {
          event.stopPropagation();
          const symbol = stock.symbol;
          const name = stock.name;
          router.navigate(`trading/details?symbol=${symbol}&name=${name}`);
        });
        infoDiv.appendChild(stockDetailsButton);

        const detailImg = document.createElement('img');
        detailImg.src = './../../../../details.png';
        stockDetailsButton.appendChild(detailImg);

        // To:Do Hinzufügen der Informationen zur Aktie...
      }
    }
  }

  async createStockCandles(element: HTMLCanvasElement, symbol: string, intervall: string) {
    const a = this.unixTimestamp(intervall);
    const data = await this.stockService!.getStockCandles(symbol, intervall, a!.timestamp, a!.now)
      .then(data => {
        return data;
      })
      .catch(error => {
        console.error('Error:', error);
      });
    const percentage = 100 - (data[0] / data[5]) * 100;
    this.stockCandle = new Chart(element, {
      type: 'line',
      data: {
        labels: ['DEC', 'JAN', 'FEB', 'MAR', 'APR', 'MAY'],
        datasets: [
          {
            data: data,
            borderColor: '#9370DB',
            backgroundColor: 'rgba(230, 230, 250,0.5)',
            borderWidth: 3,
            tension: 0.3,
            fill: true,
            pointBackgroundColor: '#411080',
            pointBorderColor: '#6A5ACD'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            callbacks: {
              label: (context: any) => {
                const currentValue = context.raw.toFixed(2);
                return `${currentValue}$`;
              }
            }
          },
          subtitle: {
            display: true,
            text: percentage.toFixed(1) + '% ',
            font: { weight: 'bolder' },
            position: 'right'
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

  unixTimestamp(s: string) {
    const now = new Date();
    let t: Date | null = null;

    if (s === 'D') {
      t = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
    } else if (s === 'M') {
      t = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
    } else if (s === 'Y') {
      t = new Date(now.getFullYear() - 6, now.getMonth(), now.getDate());
    }

    if (t) {
      return {
        timestamp: Math.floor(t.getTime() / 1000).toString(),
        now: Math.floor(now.getTime() / 1000).toString()
      };
    }
  }

  // Funktion zur Berechnung des Wertes einer einzelnen Aktie
  calculateStockValue(stock: UserStock): number {
    return stock.price * stock.shares;
  }

  // Funktion zur Berechnung des Gesamtwertes aller Aktien
  calculateTotalValue(): number {
    let totalValue = 0;
    for (const stock of this.userStocks) {
      if (stock.shares > 0) {
        totalValue += this.calculateStockValue(stock);
      }
    }
    return Number(totalValue.toFixed(2));
  }

  async buyStock(event: Event, stock: UserStock) {
    console.log(stock);
    try {
      if (!this.stockService) {
        throw new Error('StockService not active!');
      }
      const bPrice = (await this.stockService.getFirstData(stock.symbol)).price;
      if (!bPrice || isNaN(bPrice)) {
        // Überprüfen, ob bPrice leer oder ungültig ist
        this.showNotification('Failed to retrieve stock price', 'error');
        return;
      }
      if (this.money < bPrice) {
        throw new Error('Insufficient funds');
      }
      const pValue = this.money + this.calculateTotalValue();
      const response = await httpClient.post('/trading/', {
        symbol: stock.symbol,
        name: stock.name,
        image: stock.image,
        bPrice: bPrice,
        pValue: pValue
      });
      if (response.status === 201) {
        const data = await response.json();
        stock.shares++;
        this.money = data.money;
        if (this instanceof PortfolioComponent) {
          this.updateDoughnut();
          this.updateGraph();
        }
        this.requestUpdate();
      } else {
        throw new Error('Failed to purchase stock');
      }
    } catch (e) {
      this.showNotification((e as Error).message, 'error');
    }
  }

  async sellStock(event: Event, stock: UserStock) {
    try {
      if (stock.shares == 0) {
        throw new Error('No Share in Stock!');
      }
      if (!this.stockService) {
        throw new Error('StockService not active!');
      }
      const sPrice = (await this.stockService.getFirstData(stock.symbol)).price;
      if (!sPrice || isNaN(sPrice)) {
        // Überprüfen, ob bPrice leer oder ungültig ist
        this.showNotification('Failed to retrieve stock price', 'error');
        return;
      }
      const pValue = this.money + this.calculateTotalValue();
      const response = await httpClient.patch('/trading/', {
        symbol: stock.symbol,
        name: stock.name,
        image: stock.image,
        sPrice: sPrice,
        pValue: pValue
      });
      const data = await response.json();
      stock.shares--;
      if (this instanceof PortfolioComponent) {
        this.updateDoughnut();
        this.updateGraph();
        if (stock.shares === 0) {
          this.userStocks = this.userStocks.filter(s => s.symbol !== stock.symbol);
          this.showNotification(`Last stock of ${stock.name} was sold`, 'info');
        }
      }
      this.money = data.money;
      this.requestUpdate();
    } catch (e) {
      this.showNotification((e as Error).message, 'error');
    }
  }
}
