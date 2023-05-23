/* Author: Alexander Schellenberg */

import { Entity } from './entity';

export interface Stock extends Entity {
  symbol: string;
  name: string;
  image: string;
}
