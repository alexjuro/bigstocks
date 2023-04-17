/* Autor: Alexander Schellenberg */

import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { PageMixin } from '../page.mixin';
import { property } from "lit-element";
import { PortfolioComponent } from '../portfolio/portfolio';

export type Stock = {
  symbol: string;
  price: number;
  
};

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
                console.log(message);
                if (message.type === 'trade' && message.data) {
                    const { s: symbol, p: price } = message.data[0];
                    if (this.subscriptions.has(symbol)) {
                        this.notifyObservers(symbol, price);
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
            observer.setPrice(symbol, price);
        }
        observer.requestUpdate();
        
    }
  }


}