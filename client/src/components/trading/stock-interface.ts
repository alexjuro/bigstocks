/* Autor: Alexander Schellenberg */

export interface Stock {
  name: string;
  symbol: string;
  image: string;
  price: number;
  dailyPercentage: number;
}

export interface UserStock extends Stock {
  shares: number;
}
