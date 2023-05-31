/* Author: Alexander Schellenberg */

import { Entity } from './entity';

export interface Note extends Entity {
  symbol: string;
  note: string;
}
