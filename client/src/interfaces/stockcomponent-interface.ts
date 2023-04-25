/* Autor: Alexander Schellenberg */

import { Stock } from './stock-interface.js';

export interface StockComponent{
    getStocks(): Stock[];
    getStockSymbols(): string[];
    getStockNames(): string[];
    getStockPrices(): number[];
    sendSubscriptions(): void;
    
}
