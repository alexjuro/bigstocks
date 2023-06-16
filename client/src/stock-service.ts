/* Autor: Alexander Schellenberg */
import { PortfolioComponent } from './components/trading/portfolio/portfolio.js';
import { TradingComponent } from './components/trading/tradingcomponent.js';

const apiKey = [
  'cgsjqchr01qkrsgj9tk0cgsjqchr01qkrsgj9tkg',
  'chm9grpr01qs8kipkgf0chm9grpr01qs8kipkgfg',
  'chm9k69r01qs8kipkhlgchm9k69r01qs8kipkhm0',
  'chm9lj9r01qs8kipki20chm9lj9r01qs8kipki2g',
  'chvpmcpr01qp0736hs1gchvpmcpr01qp0736hs20'
];

export class StockService {
  private socket: WebSocket | null = null;
  private subscriptions: Set<string> = new Set();
  private observer: TradingComponent | null = null;
  private intervalId: NodeJS.Timeout | null = null;
  private apiCounter = 0;

  // eslint-disable-next-line @typescript-eslint/member-ordering
  public isConnected = false;

  public async connectSocket(): Promise<void> {
    if (this.isConnected) {
      console.log('WebSocket is already connected.');
      return;
    }

    while (!this.isConnected) {
      try {
        this.socket = new WebSocket(`wss://ws.finnhub.io?token=${this.getApiKey()}`);
        await new Promise<void>((resolve, reject) => {
          this.socket!.onopen = () => {
            console.log('WebSocket connection established.');
            this.isConnected = true;
            resolve();
          };
          this.socket!.onerror = error => {
            console.error(`WebSocket error: ${error}`);
            reject(error);
          };
        });
      } catch (error) {
        console.log('WebSocket connection failed. Retrying in 0.5 seconds...');
        this.socket?.close();
        await new Promise<void>(resolve => setTimeout(resolve, 500));
      }
    }

    this.socket!.onclose = event => {
      if (!event.wasClean) {
        console.log('WebSocket connection closed unexpectedly. Trying to reconnect...');
        this.isConnected = false;
        this.connectSocket();
      }
    };

    this.socket!.onmessage = event => {
      if (!this.isConnected) {
        console.log('WebSocket is not connected. Ignoring incoming message.');
        return;
      }

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

  public getSocket() {
    return this.socket;
  }

  public closeSocket() {
    this.socket?.close();
  }

  public subscribe(symbol: string): void {
    this.subscriptions.add(symbol);
    this.sendRequest(symbol);
    this.getFirstData(symbol).then(value => {
      this.notifyPriceObserver(symbol, Number(value.price.toFixed(2))),
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

  public removeObserver(): void {
    this.observer = null;
  }

  public async updateStockPercentages() {
    const delay = 500;
    setInterval(async () => {
      for (const symbol of this.subscriptions) {
        this.intervalId = setTimeout(async () => {
          const response = await fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${this.getApiKey()}`);
          const data = await response.json();
          const dailyPercentage = ((data.c - data.pc) / data.pc) * 100;
          this.observer!.updateStockDailyPercentage(symbol, Number(dailyPercentage.toFixed(1)));
          this.observer!.requestUpdate();
        }, delay);
      }
      this.observer!.requestUpdate();
    }, 8000);
  }

  public stopUpdatingStockPercentages() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  public async getStockCandles(symbol: string, intervall: string, from: string, to: string) {
    const response = await fetch(
      `https://finnhub.io/api/v1/stock/candle?symbol=${symbol}&resolution=${intervall}&from=${from}&to=${to}&token=` +
        this.getApiKey()
    );
    const data = await response.json();
    return data.c;
  }

  public async getFirstData(symbol: string) {
    const response = await fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${this.getApiKey()}`);
    const data = await response.json();
    const price = Number(data.c.toFixed(2));
    const percentage = Number((((data.c - data.pc) / data.pc) * 100).toFixed(2));
    return { price, percentage };
  }

  public async getRecommendationBySymbol(symbol: string) {
    const response = await fetch(
      `https://finnhub.io/api/v1/stock/recommendation?symbol=${symbol}&token=${this.getApiKey()}`
    );
    const data = await response.json();
    return data[0];
  }

  public async getCompanyProfilBySymbol(symbol: string) {
    const response = await fetch(
      `https://finnhub.io/api/v1//stock/profile2?symbol=${symbol}&token=${this.getApiKey()}`
    );
    const data = await response.json();
    return data;
  }

  private getApiKey() {
    const key = apiKey[this.apiCounter];
    this.apiCounter++;
    if (this.apiCounter >= apiKey.length) {
      this.apiCounter = 0;
    }
    return key;
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
        this.observer.updateGraph();
      }
    }
  }
}
