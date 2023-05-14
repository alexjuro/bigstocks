/* Author: Alexander Schellenberg */

import { Stock } from './stock';

export interface TransactionStock extends Stock {
  bPrice: number;
  sPrice: number;
}
