import { customElement } from 'lit/decorators.js';
import { PageMixin } from '../page.mixin';
import { LitElement, html } from 'lit';
import { StockService } from '../../stock-service.js';
import { stocks, UserStock } from '../../interfaces/stock-interface.js';

export abstract class StockComponent extends PageMixin(LitElement){
  protected userStocks: UserStock[] = [];
  protected stockService: StockService | null = null;

  getStocks(): UserStock[] {
    return this.userStocks;
  }

  getStockSymbols(): string[] {
    return this.userStocks.map((stock) => stock.symbol);
  }

  getStockNames(): string[] {
    return this.userStocks.map((stock) => stock.name);
  }

  getStockPrices(): number[] {
    return this.userStocks.map((stock) => stock.price);
  }

  getStockDailyPercentage(): number[] {
    return this.userStocks.map((stock) => stock.dailyPercentage);
  }

  sendSubscriptions(): void{
    for (const stock of this.userStocks) {
      this.stockService!.subscribe(stock.symbol);
    }
  }

    updateStockPrice(symbol: string, price: number): void {
    let cssClass = "blinkRed";
    for (const stock of this.userStocks) {
      if (stock.symbol === symbol) {
        if (stock.price === price) {
          break;
        }
        if (stock.price < price) {
          cssClass = "blinkGreen";
        }
        stock.price = price;

          if (this.shadowRoot) {
              const element = this.shadowRoot.getElementById("dot" + stock.symbol);
          
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
        
        const stock = this.userStocks.find((s) => s.symbol === symbol);
        if (!stock) return;

        if (this.shadowRoot) {
            const element = this.shadowRoot.getElementById(`perc${stock.symbol}`);
            if (!element) {
                console.log("FAIL");
                return;
            }

            element.classList.remove("setTextGreen", "setTextRed");
            const cssClass = percentage >= 0 ? "setTextGreen" : "setTextRed";
            element.classList.add(cssClass);
            stock.dailyPercentage = percentage;
        }
    }

  getStockShares(): number[] {
    return this.userStocks.map((stock) => stock.shares);
  }
    


}
