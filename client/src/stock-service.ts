/* Autor: Alexander Schellenberg */

import { PortfolioComponent } from './components/trading/portfolio/portfolio';
const apiKey = 'cgsjqchr01qkrsgj9tk0cgsjqchr01qkrsgj9tkg';
import { TradingComponent } from './components/trading/tradingcomponent.js';

export class StockService {
  private socket: WebSocket | null = null;
  private subscriptions: Set<string> = new Set();
  private observer: TradingComponent | null = null;

  public async connectSocket(): Promise<void> {
    let isConnected = false;

    while (!isConnected) {
      try {
        this.socket = new WebSocket(`wss://ws.finnhub.io?token=${apiKey}`);
        await new Promise<void>((resolve, reject) => {
          this.socket!.onopen = () => {
            console.log('WebSocket connection established.');
            isConnected = true;
            resolve();
          };
          this.socket!.onerror = error => {
            console.error(`WebSocket error: ${error}`);
            reject(error);
          };
        });
      } catch (error) {
        console.log('WebSocket connection failed. Retrying in 10 seconds...');
        this.socket?.close(); // WebSocket schließen, bevor erneuter Verbindungsversuch unternommen wird
        await new Promise<void>(resolve => setTimeout(resolve, 10000));
      }
    }

    this.socket!.onclose = event => {
      if (!event.wasClean) {
        console.log('WebSocket connection closed unexpectedly. Trying to reconnect...');
        this.connectSocket();
      }
    };

    this.socket!.onmessage = event => {
      const message = JSON.parse(event.data);
      if (message.type === 'trade' && message.data) {
        const { s: symbol, p: price } = message.data[0];
        if (this.subscriptions.has(symbol)) {
          this.notifyPriceObserver(symbol, price.toFixed(2));
        }
      }
    };
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

  public setObserver(observer: TradingComponent): void {
    this.observer = observer;
  }

  public removeObserver(observer: TradingComponent): void {
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
    if (this.observer instanceof TradingComponent) {
      this.observer!.updateStockPrice(symbol, price);
      this.observer!.requestUpdate();
      if (this.observer instanceof PortfolioComponent) {
        this.observer.updateDoughnut();
      }
    }
  }
}
