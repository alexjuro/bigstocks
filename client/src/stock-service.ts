/* Autor: Alexander Schellenberg */

import { LitElement } from 'lit';
import { PortfolioComponent } from './components/portfolio/portfolio';
const apiKey = 'cgsjqchr01qkrsgj9tk0cgsjqchr01qkrsgj9tkg';

export class StockService {
    private socket: WebSocket | null = null;
    private subscriptions: Set<string> = new Set();
    private observers: Set<LitElement> = new Set();

    
    public async connectSocket(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.socket = new WebSocket(`wss://ws.finnhub.io?token=${apiKey}`);
            this.socket.onopen = () => {
                console.log('WebSocket connection established.');
                this.getStockCandles();
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
                        this.notifyObservers(symbol, price.toFixed(2));
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
  }

  public unsubscribe(symbol: string): void {
    this.subscriptions.delete(symbol);
    this.sendRequest(symbol, 'unsubscribe');
  }
    

  public addObserver(observer: LitElement): void {
    this.observers.add(observer);
  }

  public removeObserver(observer: LitElement): void {
    this.observers.delete(observer);
  }

  private sendRequest(symbol: string, action = 'subscribe'): void {
      const message = JSON.stringify({ type: action, symbol: symbol });
      this.socket?.send(message);
      console.log(this.socket + " sendRequest: " + action + " " + symbol);
  }

  private notifyObservers(symbol : String, price: number): void {
      for (const observer of this.observers) {
        if (observer instanceof PortfolioComponent)
        {
            observer.updateStockPrice(symbol, price);
        }
        observer.requestUpdate();
        
    }
  }
    //interval: String, symbol: String
    private getStockCandles() {
        fetch("https://finnhub.io/api/v1/stock/candle?symbol=AAPL&resolution=D&from=1681923600&to=1682442000&token=" + apiKey)
            .then(response => response.json())
            .then(data => {
                console.log(data.c); // die JSON-Daten werden hier ausgegeben
            })
            .catch(error => {
                console.error(error);
            });
    }


}