/* Autor: Alexander Schellenberg */

import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { PageMixin } from '../page.mixin';
import { property } from "lit-element";

export type Stock = {
  symbol: string;
  price: number;
  
};

const apiKey = 'cgsjqchr01qkrsgj9tk0cgsjqchr01qkrsgj9tkg';

export class StockService{
    private socket: WebSocket | null = null;
    private stocks: Map<string, Stock> = new Map();
    private subscriptions: Set<string> = new Set();
    private observers: Set<LitElement> = new Set();

    
    public async connectSocket() {
        this.socket = await new WebSocket(`wss://ws.finnhub.io?token=${apiKey}`);
        this.socket.onopen = () => {
            console.log('WebSocket connection established.');
        };
        this.socket.onerror = (error) => {
            console.error(`WebSocket error: ${error}`);
            };

        this.socket.onclose = () => {
            console.log('WebSocket connection closed.');
            };
        this.socket.onmessage = (event) => {
            const message = JSON.parse(event.data);
            if (message.type === 'trade' && message.data) {
                const { s: symbol, p: price } = message.data[0];
                if (this.subscriptions.has(symbol)) {
                    this.stocks.set(symbol, { symbol, price });
                    this.notifyObservers();
                }
            }
        };
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

  public getStock(symbol: string): Stock | undefined {
    return this.stocks.get(symbol);
  }

  public addObserver(observer: LitElement): void {
    this.observers.add(observer);
  }

  public removeObserver(observer: LitElement): void {
    this.observers.delete(observer);
  }

  private sendRequest(symbol: string, action = 'subscribe'): void {
    const message = JSON.stringify({ type: action, symbol });
    this.socket?.send(message);
  }

  private notifyObservers(): void {
    for (const observer of this.observers) {
      observer.requestUpdate();
    }
  }


}

/*
    async addUsersStocks() {
        this.socket?.addEventListener('open', (event) => {
        
        this.stocks.forEach(stock => {
          this.socket?.send(JSON.stringify({ type: 'subscribe', symbol: stock.symbol }));
        });
      });
    }

    async updateUsersStocks() {
        this.socket?.addEventListener('message', (event) => {
        const data = JSON.parse(event.data);

        if (data.type === 'trade' && data.data && data.data[0]) {
          const an = data.data[0];
          const stockIndex = this.stocks.findIndex(stock => stock.symbol === an.s);

          if (stockIndex >= 0) {
            this.stocks[stockIndex].price = an.p;
            this.requestUpdate();
          }
        }
      });
    }
    */