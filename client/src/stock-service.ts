/* Autor: Alexander Schellenberg */

import { PortfolioComponent } from './components/trading/portfolio/portfolio';
const apiKey = 'cgsjqchr01qkrsgj9tk0cgsjqchr01qkrsgj9tkg';
import { StockComponent } from './components/trading/stockcomponent.js';

export class StockService {
  private socket: WebSocket | null = null;
  private subscriptions: Set<string> = new Set();
  private observer: StockComponent | null = null;

  public async connectSocket(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket = new WebSocket(`wss://ws.finnhub.io?token=${apiKey}`);
      this.socket.onopen = () => {
        console.log('WebSocket connection established.');
        resolve();
      };
      this.socket.onerror = error => {
        console.error(`WebSocket error: ${error}`);
      };

      this.socket.onclose = () => {
        console.log('WebSocket connection closed. Try reconnecting!');
        setTimeout(() => {
          console.log('Reconnecting WebSocket...');
          this.connectSocket(); // Aufruf der Methode zum erneuten Verbindungsaufbau
        }, 10000);
      };

      this.socket.onmessage = event => {
        const message = JSON.parse(event.data);
        if (message.type === 'trade' && message.data) {
          const { s: symbol, p: price } = message.data[0];
          if (this.subscriptions.has(symbol)) {
            this.notifyPriceObserver(symbol, price.toFixed(2));
          }
        }
      };
    });
  }

  public getSubscriptions() {
    return this.subscriptions;
  }

  public closeSocket() {
    this.socket?.close();
  }

  public subscribe(symbol: string): void {
    this.subscriptions.add(symbol);
    this.sendRequest(symbol);
    this.getFirstData(symbol).then(value => {
      this.notifyPriceObserver(symbol, value.price),
        this.observer!.updateStockDailyPercentage(symbol, Number(value.percentage.toFixed(1)));
    });
  }

  public unsubscribe(symbol: string): void {
    this.subscriptions.delete(symbol);
    this.sendRequest(symbol, 'unsubscribe');
  }

  public setObserver(observer: StockComponent): void {
    this.observer = observer;
  }

  public removeObserver(observer: StockComponent): void {
    this.observer = null;
  }

  public async updateStockPercentages() {
    const delay = 500;
    setInterval(async () => {
      for (const symbol of this.subscriptions) {
        setTimeout(async () => {
          const response = await fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`);
          const data = await response.json();
          const dailyPercentage = ((data.c - data.pc) / data.pc) * 100;
          this.observer!.updateStockDailyPercentage(symbol, Number(dailyPercentage.toFixed(1)));
          this.observer!.requestUpdate();
        }, delay);
      }
      this.observer!.requestUpdate();
    }, 20000);
  }

  public async getStockCandles(symbol: string, intervall: string, from: string, to: string) {
    const response = await fetch(
      `https://finnhub.io/api/v1/stock/candle?symbol=${symbol}&resolution=${intervall}&from=${from}&to=${to}&token=` +
        apiKey
    );
    const data = await response.json();
    return data.c;
  }

  private async getFirstData(symbol: string) {
    const response = await fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`);
    const data = await response.json();
    return { price: data.c, percentage: ((data.c - data.pc) / data.pc) * 100 };
  }

  private sendRequest(symbol: string, action = 'subscribe'): void {
    const message = JSON.stringify({ type: action, symbol: symbol });
    this.socket?.send(message);
    console.log(this.socket + ' sendRequest: ' + action + ' ' + symbol);
  }

  private notifyPriceObserver(symbol: string, price: number): void {
    if (this.observer instanceof StockComponent) {
      this.observer!.updateStockPrice(symbol, price);
      this.observer!.requestUpdate();
      if (this.observer instanceof PortfolioComponent) {
        this.observer.updateDoughnut();
      }
    }
  }
}
