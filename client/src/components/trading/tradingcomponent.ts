/* Autor: Alexander Schellenberg */
import { PageMixin } from '../page.mixin';
import { LitElement } from 'lit';
import { StockService } from '../../stock-service.js';
import { Stock } from '../../interfaces/stock-interface.js';
import Chart from 'chart.js/auto';
import { router } from '../../router/router.js';

export abstract class TradingComponent extends PageMixin(LitElement) {
  protected userStocks: Stock[] = [];
  protected stockService: StockService | null = null;
  protected stockCandle: object | null = null;

  getStocks(): Stock[] {
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

  handleStockClick(event: MouseEvent) {
    const stockDiv = (event.target as HTMLElement).closest('.stock');
    console.log('EVENT!');
    if (stockDiv) {
      console.log('test');
      const element = stockDiv.parentElement?.querySelector('.candle-div');
      const infoDiv = stockDiv.parentElement?.querySelector('.info-div');

      if (element || infoDiv) {
        element?.remove();
        infoDiv?.remove();
      } else {
        const newEmptyDiv = document.createElement('div');
        newEmptyDiv.classList.add('candle-div');
        stockDiv.appendChild(newEmptyDiv);

        // Erstellung Canvas
        const canvasElement = document.createElement('canvas');
        canvasElement.width = 200;
        canvasElement.height = 300;
        newEmptyDiv.appendChild(canvasElement);
        this.createStockCandles(canvasElement, stockDiv.id, 'M');

        // Erstellung der infoDiv für zusätzliche Informationen und Buttons
        const infoDiv = document.createElement('div');
        infoDiv.classList.add('info-div');
        stockDiv.appendChild(infoDiv);

        // Erstellung des Kaufen-Buttons
        const buyButton = document.createElement('button');
        buyButton.textContent = 'Kaufen';
        buyButton.addEventListener('click', event => {
          event.stopPropagation();
          console.log('Kauf'); // Hier muss die entsprechende Methode für den Kauf der Aktie implementiert werden
        });
        infoDiv.appendChild(buyButton);

        // Erstellung des Verkaufen-Buttons
        const sellButton = document.createElement('button');
        sellButton.textContent = 'Verkaufen';
        sellButton.addEventListener('click', event => {
          event.stopPropagation();
          console.log('Verkauf'); // Hier muss die entsprechende Methode für den Verkauf der Aktie implementiert werden
        });
        infoDiv.appendChild(sellButton);

        // Erstellung des StockDetails-Buttons
        const stockDetailsButton = document.createElement('button');
        stockDetailsButton.textContent = 'StockDetails';
        stockDetailsButton.classList.add('stockdetails');
        stockDetailsButton.addEventListener('click', event => {
          event.stopPropagation();
          const stockId = stockDiv.id;
          // Navigiere zur Route "/trading/stockdetails/:id"
          router.navigate('/trading/stockdetails' + stockId);
        });
        infoDiv.appendChild(stockDetailsButton);

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
        labels: ['NOV', 'DEC', 'JAN', 'FEB', 'MAR', 'APR'],
        datasets: [
          {
            data: data,
            borderColor: '#9370DB',
            backgroundColor: '#9370DB',
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
            font: { weight: 'bold' },
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
}
