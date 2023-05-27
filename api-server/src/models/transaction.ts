/* Author: Alexander Schellenberg */

import { Stock } from './stock';

export interface Transaction extends Stock {
  userId: string;
  symbol: string;
  name: string;
  image: string;
  bPrice: number;
  sPrice: number;
  status: boolean;
  soldAt: number;
}
