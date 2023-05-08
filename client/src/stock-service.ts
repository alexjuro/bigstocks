/* Autor: Alexander Schellenberg */

import { LitElement } from 'lit';
import { PortfolioComponent } from './components/trading/portfolio/portfolio';
const apiKey = 'cgsjqchr01qkrsgj9tk0cgsjqchr01qkrsgj9tkg';
import { StockComponent } from './components/trading/stockcomponent.js';
import { stocks, UserStock } from './interfaces/stock-interface.js';

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
            }
            this.socket.onerror = (error) => {
                console.error(`WebSocket error: ${error}`);
                reject();
            };

            this.socket.onclose = () => {
                console.log('WebSocket connection closed.');
                reject();
            };
    
            this.socket.onmessage = (event) => {
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
    public getSubscriptions()
    {
        return this.subscriptions;
    }

    public closeSocket() {
        this.socket?.close;
    }
    
    public subscribe(symbol: string): void {
        this.subscriptions.add(symbol);
        this.sendRequest(symbol);
        this.getPrice(symbol).then((value) => this.notifyPriceObserver(symbol, value));
    }
    
    public unsubscribe(symbol: string): void {
        this.subscriptions.delete(symbol);
        this.sendRequest(symbol, 'unsubscribe');
    }

    private async getPrice(symbol: string) {
        const response = await fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`);
        const data = await response.json();
        return data.c;
    }
    

  public addObserver(observer: StockComponent): void {
      this.observer = observer;
  }

  public removeObserver(observer: StockComponent): void {
      this.observer = null;
  }

  private sendRequest(symbol: string, action = 'subscribe'): void {
      const message = JSON.stringify({ type: action, symbol: symbol });
      this.socket?.send(message);
      console.log(this.socket + " sendRequest: " + action + " " + symbol);
  }

  private notifyPriceObserver(symbol : string, price: number): void {
      if (this.observer instanceof StockComponent) {
          this.observer!.updateStockPrice(symbol, price);
          this.observer!.requestUpdate();
          if (this.observer instanceof PortfolioComponent)
          {
              this.observer.updateDoughnut();
          }
          
      }
        
    }
  
    
    public async updateStockPercentages() {
        setInterval(async () => {
            for (const symbol of this.subscriptions) {
                const response = await fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`);
                const data = await response.json();
                const dailyPercentage = (data.c - data.pc) / data.pc * 100;
                this.observer!.updateStockDailyPercentage(symbol, Number(dailyPercentage.toFixed(1)))
            }
            this.observer!.requestUpdate();
            
        }, 10000);
    }
    
    /*
    //interval: String, symbol: String
    private getStockCandles() {
        fetch("https://finnhub.io/api/v1/stock/candle?symbol=AAPL&resolution=D&from=1681923600&to=1682442000&token=" + apiKey)
            .then(response => response.json())
            .then(data => {
                console.log("Candle " + data.c);
            })
            .catch(error => {
                console.error(error);
            });
        fetch("https://finnhub.io/api/v1/quote?symbol=AAPL&token=" + apiKey)
            .then(response => 
                response.json())
            .then(data => {
                console.log("Change : " + data.d+ " PerChange : "+ data.dp); 
            })
            .catch(error => {
                console.error(error);
            });
    }

    */

    
    



}