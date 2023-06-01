/* Author: Alexander Schellenberg */

import { Entity } from './entity';

export interface Note extends Entity {
  userId: string;
  symbol: string;
  note: string;
}
