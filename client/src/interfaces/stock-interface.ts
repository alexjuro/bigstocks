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

export const stocks: Stock[] = [
  {
    name: 'Apple',
    symbol: 'AAPL',
    image: 'https://logo.clearbit.com/apple.com',
    price: 0,
    dailyPercentage: 0
  },
  {
    name: 'Microsoft',
    symbol: 'MSFT',
    image: 'https://logo.clearbit.com/microsoft.com',
    price: 0,
    dailyPercentage: 0
  },
  {
    name: 'Amazon',
    symbol: 'AMZN',
    image: 'https://logo.clearbit.com/amazon.com',
    price: 0,
    dailyPercentage: 0
  },
  {
    name: 'Meta',
    symbol: 'META',
    image: 'https://logo.clearbit.com/meta.com',
    price: 0,
    dailyPercentage: 0
  },
  {
    name: 'Tesla',
    symbol: 'TSLA',
    image: 'https://logo.clearbit.com/tesla.com',
    price: 0,
    dailyPercentage: 0
  },
  {
    name: 'Alphabet',
    symbol: 'GOOGL',
    image: 'https://logo.clearbit.com/google.com',
    price: 0,
    dailyPercentage: 0
  },
  {
    name: 'Netflix',
    symbol: 'NFLX',
    image: 'https://logo.clearbit.com/netflix.com',
    price: 0,
    dailyPercentage: 0
  },
  {
    name: 'JP Morgan Chase',
    symbol: 'JPM',
    image: 'https://logo.clearbit.com/jpmorganchase.com',
    price: 0,
    dailyPercentage: 0
  },
  {
    name: 'Visa',
    symbol: 'V',
    image: 'https://logo.clearbit.com/visa.com',
    price: 0,
    dailyPercentage: 0
  },
  {
    name: 'Johnson & Johnson',
    symbol: 'JNJ',
    image: 'https://logo.clearbit.com/jnj.com',
    price: 0,
    dailyPercentage: 0
  },
  {
    name: 'Walmart',
    symbol: 'WMT',
    image: 'https://logo.clearbit.com/walmart.com',
    price: 0,
    dailyPercentage: 0
  },
  {
    name: 'Procter & Gamble',
    symbol: 'PG',
    image: 'https://logo.clearbit.com/pg.com',
    price: 0,
    dailyPercentage: 0
  },
  {
    name: 'Mastercard',
    symbol: 'MA',
    image: 'https://logo.clearbit.com/mastercard.com',
    price: 0,
    dailyPercentage: 0
  },
  {
    name: 'Verizon Communications',
    symbol: 'VZ',
    image: 'https://logo.clearbit.com/verizon.com',
    price: 0,
    dailyPercentage: 0
  },
  {
    name: 'Coca-Cola',
    symbol: 'KO',
    image: 'https://logo.clearbit.com/coca-cola.com',
    price: 0,
    dailyPercentage: 0
  },
  {
    name: 'Pfizer',
    symbol: 'PFE',
    image: 'https://logo.clearbit.com/pfizer.com',
    price: 0,
    dailyPercentage: 0
  },
  {
    name: 'NVIDIA',
    symbol: 'NVDA',
    image: 'https://logo.clearbit.com/nvidia.com',
    price: 0,
    dailyPercentage: 0
  },
  {
    name: 'Home Depot',
    symbol: 'HD',
    image: 'https://logo.clearbit.com/homedepot.com',
    price: 0,
    dailyPercentage: 0
  },
  {
    name: 'AT&T',
    symbol: 'T',
    image: 'https://logo.clearbit.com/att.com',
    price: 0,
    dailyPercentage: 0
  },
  {
    name: 'Intel',
    symbol: 'INTC',
    image: 'https://logo.clearbit',
    price: 0,
    dailyPercentage: 0
  }
]